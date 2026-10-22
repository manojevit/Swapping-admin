"use client";

import { useMemo, useState } from "react";
import {
  Cpu, UploadCloud, Boxes, CircleCheck, TriangleAlert, RefreshCw, Download, Play, FileUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/layout/no-access";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/lib/session";
import {
  FIRMWARE_BOARDS, FIRMWARE_IMAGES, FIRMWARE_JOBS, FIRMWARE_FLEET, FIRMWARE_LATEST,
  ORGS, type FirmwareBoard, type FirmwareJobStatus,
} from "@/lib/mock";
import { cn, exportCsv, timeAgo } from "@/lib/utils";

const BOARD_LABEL: Record<FirmwareBoard, string> = {
  station: "Station", slot: "Slot", gateway: "Gateway", bootloader: "Bootloader",
};

const JOB_TONE: Record<FirmwareJobStatus, "info" | "success" | "danger" | "neutral"> = {
  downloading: "info", installing: "info", done: "success", failed: "danger", scheduled: "neutral",
};
const JOB_LABEL: Record<FirmwareJobStatus, string> = {
  downloading: "Downloading", installing: "Installing", done: "Installed", failed: "Failed", scheduled: "Scheduled",
};

function fmtBytes(b: number) {
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(2)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${b} B`;
}

/** current | behind | unknown for a station, comparing against the latest build. */
function fleetState(stationFw: string | null) {
  if (!stationFw) return "unknown" as const;
  return stationFw === FIRMWARE_LATEST ? ("current" as const) : ("behind" as const);
}

export default function FirmwarePage() {
  const { can } = useSession();
  const { show } = useToast();

  const [board, setBoard] = useState<FirmwareBoard>("station");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");

  const [jobImage, setJobImage] = useState("");
  const [jobScope, setJobScope] = useState("org");
  const [jobOrg, setJobOrg] = useState("");
  const [jobSlot, setJobSlot] = useState("");
  const [jobWhen, setJobWhen] = useState("");
  const [jobRetries, setJobRetries] = useState("2");

  const [behindOnly, setBehindOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const behindCount = useMemo(
    () => FIRMWARE_FLEET.filter((r) => fleetState(r.stationFw) === "behind").length,
    [],
  );
  const currentCount = useMemo(
    () => FIRMWARE_FLEET.filter((r) => fleetState(r.stationFw) === "current").length,
    [],
  );
  const activeJobs = FIRMWARE_JOBS.filter((j) => j.status !== "done" && j.status !== "failed").length;

  const fleetRows = useMemo(
    () => (behindOnly ? FIRMWARE_FLEET.filter((r) => fleetState(r.stationFw) === "behind") : FIRMWARE_FLEET),
    [behindOnly],
  );

  if (!can("manage_firmware"))
    return <NoAccess title="Firmware" subtitle="Ship and track OTA firmware across the station network." />;

  function uploadImage() {
    if (!fileName) { show("Choose a container first", { description: "Select an OTA .bin to upload.", tone: "warn" }); return; }
    show("Image accepted", { description: `${BOARD_LABEL[board]} · ${fileName}` });
    setFileName(""); setNotes("");
  }

  function startJob() {
    if (!jobImage) { show("Pick an image", { description: "Choose which firmware to roll out.", tone: "warn" }); return; }
    if (jobScope === "org" && !jobOrg) { show("Pick an organisation", { description: "Choose whose stations to target.", tone: "warn" }); return; }
    const where = jobScope === "org" ? ORGS.find((o) => o.id === jobOrg)?.name ?? "organisation" : "all stations";
    show("Firmware job started", { description: `${jobImage} → ${where}${jobWhen ? ` · installs ${new Date(jobWhen).toLocaleString("en-GB")}` : ""}` });
  }

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Fleet versions refreshed"); }, 700);
  }

  function exportFleet() {
    exportCsv(
      "firmware-fleet-versions.csv",
      ["Station", "Name", "Organisation", "Station FW", "Bootloader", "Gateway", "Slot versions", "State", "Last seen"],
      FIRMWARE_FLEET.map((r) => [
        r.stationCode, r.stationName, r.orgName, r.stationFw ?? "—", r.bootloader ?? "—", r.gateway ?? "—",
        r.slotVersions.join(" / ") || "—", fleetState(r.stationFw), new Date(r.lastSeen).toISOString(),
      ]),
    );
    show("Fleet versions exported", { description: `${FIRMWARE_FLEET.length} stations · CSV` });
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Admin / Firmware"
        title="Firmware"
        subtitle="Ship OTA images to the station fleet, watch jobs, and see who is behind. Times in IST."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi icon={<Boxes className="h-5 w-5" />} label="Images" value={String(FIRMWARE_IMAGES.length)} sub="In the registry" tone="neutral" />
        <Kpi icon={<Play className="h-5 w-5" />} label="Active jobs" value={String(activeJobs)} sub="Downloading or installing" tone="neutral" />
        <Kpi icon={<CircleCheck className="h-5 w-5" />} label={`On ${FIRMWARE_LATEST}`} value={String(currentCount)} sub="Stations on latest" tone="success" />
        <Kpi icon={<TriangleAlert className="h-5 w-5" />} label="Behind" value={String(behindCount)} sub="Need an update" tone="warn" />
      </div>

      {/* Upload an OTA container */}
      <Card className="mb-4">
        <CardHeader icon={<UploadCloud className="h-4 w-4" />} title="Upload an OTA container" subtitle="The board, version, length and CRC are read from the container header. The declared board below is what the server checks the file against — a mismatch is refused here, not by cabinets in the field." />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 pt-4 md:grid-cols-[180px_1fr_auto] md:items-end">
          <Labeled label="Board (declared)">
            <select value={board} onChange={(e) => setBoard(e.target.value as FirmwareBoard)} className={inputCls}>
              {FIRMWARE_BOARDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </Labeled>
          <Labeled label="Notes">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What changed in this build" className={inputCls} />
          </Labeled>
          <Labeled label="Container">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[13px] font-semibold text-ink hover:bg-canvas">
              <FileUp className="h-4 w-4 text-muted" />
              {fileName ? <span className="max-w-[160px] truncate">{fileName}</span> : "Choose file…"}
              <input type="file" accept=".bin,.ota,.img" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
            </label>
          </Labeled>
          <div className="md:col-span-3 md:flex md:justify-end">
            <Button variant="primary" onClick={uploadImage}><UploadCloud className="h-4 w-4" /> Upload image</Button>
          </div>
        </div>
      </Card>

      {/* Image registry */}
      <Card className="mb-4">
        <CardHeader icon={<Boxes className="h-4 w-4" />} title="Image registry" subtitle={`${FIRMWARE_IMAGES.length} images available to roll out`} />
        <div className="mt-3">
          <Table>
            <THead>
              <TH>Version</TH><TH>Board</TH><TH align="right">Size</TH><TH>CRC32</TH><TH>Notes</TH><TH>Uploaded by</TH><TH>Uploaded</TH>
            </THead>
            <TBody>
              {FIRMWARE_IMAGES.map((img) => (
                <TR key={img.id}>
                  <TD className="nums font-semibold text-ink">{img.version}</TD>
                  <TD><StatusPill tone="neutral" dot={false}>{BOARD_LABEL[img.board]}</StatusPill></TD>
                  <TD align="right" className="nums text-muted">{fmtBytes(img.bytes)}</TD>
                  <TD className="nums text-faint">{img.crc}</TD>
                  <TD className="max-w-[280px] text-muted">{img.notes}</TD>
                  <TD className="text-muted">{img.uploadedBy}</TD>
                  <TD className="text-muted">{timeAgo(img.uploadedAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>

      {/* Start a firmware job */}
      <Card className="mb-4">
        <CardHeader icon={<Play className="h-4 w-4" />} title="Start a firmware job" subtitle="The download runs now; the install waits for the hour you set. One transfer per station at a time — a station already downloading is skipped and named below, not counted as a success." />
        <div className="grid grid-cols-1 gap-3 px-5 pb-3 pt-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-end">
          <Labeled label="Image">
            <select value={jobImage} onChange={(e) => setJobImage(e.target.value)} className={inputCls}>
              <option value="">Choose an image…</option>
              {FIRMWARE_IMAGES.map((img) => <option key={img.id} value={`${BOARD_LABEL[img.board]} ${img.version}`}>{BOARD_LABEL[img.board]} · {img.version}</option>)}
            </select>
          </Labeled>
          <Labeled label="Which stations">
            <select value={jobScope} onChange={(e) => setJobScope(e.target.value)} className={inputCls}>
              <option value="org">Every station in an organisation</option>
              <option value="all">Every station on the network</option>
            </select>
          </Labeled>
          <Labeled label="Organisation">
            <select value={jobOrg} onChange={(e) => setJobOrg(e.target.value)} disabled={jobScope !== "org"} className={cn(inputCls, jobScope !== "org" && "opacity-50")}>
              <option value="">Choose…</option>
              {ORGS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Labeled>
          <Labeled label="Slot (0 = every slot)">
            <input value={jobSlot} onChange={(e) => setJobSlot(e.target.value)} inputMode="numeric" placeholder="only for a slot board" className={inputCls} />
          </Labeled>
          <Labeled label="Install not before">
            <input type="datetime-local" value={jobWhen} onChange={(e) => setJobWhen(e.target.value)} className={inputCls} />
          </Labeled>
          <Labeled label="Retries">
            <input value={jobRetries} onChange={(e) => setJobRetries(e.target.value)} inputMode="numeric" className={inputCls} />
          </Labeled>
        </div>
        <div className="flex justify-end px-5 pb-5">
          <Button variant="primary" onClick={startJob}><Play className="h-4 w-4" /> Start job</Button>
        </div>
      </Card>

      {/* Active / recent jobs */}
      <Card className="mb-4">
        <CardHeader icon={<Cpu className="h-4 w-4" />} title="Recent jobs" subtitle="Rollouts started in the last few hours" />
        <div className="space-y-2.5 px-5 pb-5 pt-4">
          {FIRMWARE_JOBS.map((j) => {
            const running = j.status === "downloading" || j.status === "installing";
            return (
              <div key={j.id} className="rounded-xl border border-line px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="nums text-[14px] font-semibold text-ink">{j.stationCode}</span>
                    <span className="text-[12px] text-faint">{j.orgName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="nums text-[12px] font-medium text-muted">{j.image}</span>
                    <StatusPill tone={JOB_TONE[j.status]}>{JOB_LABEL[j.status]}</StatusPill>
                  </div>
                </div>
                {running ? (
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${j.progress}%` }} />
                  </div>
                ) : null}
                <p className="mt-2 text-[12px] text-faint">{j.note} · {timeAgo(j.startedAt)}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Fleet versions */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Fleet versions — {FIRMWARE_FLEET.length} stations</h3>
            <p className="text-[13px] text-muted">Newest station build in this fleet: <span className="nums font-semibold text-ink">{FIRMWARE_LATEST}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted">
              <input type="checkbox" checked={behindOnly} onChange={(e) => setBehindOnly(e.target.checked)} className="h-4 w-4 rounded border-line accent-brand-600" />
              Behind only
            </label>
            <Button variant="secondary" size="sm" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Refresh</Button>
            <Button variant="secondary" size="sm" onClick={exportFleet}><Download className="h-3.5 w-3.5" /> Export</Button>
          </div>
        </div>
        <div className="mt-3">
          <Table>
            <THead>
              <TH>Station</TH><TH>Organisation</TH><TH>Station FW</TH><TH>Bootloader</TH><TH>Gateway</TH><TH>Slot versions</TH><TH>State</TH><TH>Last seen</TH>
            </THead>
            <TBody>
              {fleetRows.length === 0 ? (
                <TR><TD className="py-10 text-center text-muted">Every station is on the latest build.</TD><TD /><TD /><TD /><TD /><TD /><TD /><TD /></TR>
              ) : fleetRows.map((r) => {
                const state = fleetState(r.stationFw);
                return (
                  <TR key={r.stationCode}>
                    <TD>
                      <p className="nums text-[13px] font-semibold text-ink">{r.stationCode}</p>
                      <p className="text-[12px] text-faint">{r.stationName}</p>
                    </TD>
                    <TD className="text-muted">{r.orgName}</TD>
                    <TD className="nums text-ink">{r.stationFw ?? <span className="text-faint">—</span>}</TD>
                    <TD className="nums text-muted">{r.bootloader ?? <span className="text-faint">—</span>}</TD>
                    <TD className="nums text-muted">{r.gateway ?? <span className="text-faint">—</span>}</TD>
                    <TD className="nums text-muted">{r.slotVersions.join(", ") || <span className="text-faint">—</span>}</TD>
                    <TD>
                      {state === "current" ? <StatusPill tone="success">Current</StatusPill>
                        : state === "behind" ? <StatusPill tone="warn">Behind</StatusPill>
                        : <StatusPill tone="neutral" dot={false}>No data</StatusPill>}
                    </TD>
                    <TD className="text-muted">{timeAgo(r.lastSeen)}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {fleetRows.length} of {FIRMWARE_FLEET.length} stations</p>
      </Card>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-line bg-surface px-3 text-[13px] text-ink outline-none placeholder:text-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20";

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "neutral" | "success" | "warn" }) {
  const tones = { neutral: "bg-ink/[0.045] text-muted", success: "bg-success-soft text-success-ink", warn: "bg-warn-soft text-warn-ink" };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2.5">
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", tones[tone])}>{icon}</span>
        <span className="text-[13px] font-medium text-muted">{label}</span>
      </div>
      <p className="nums mt-3 text-[28px] font-bold leading-none text-ink">{value}</p>
      <p className="mt-2 text-[12px] text-faint">{sub}</p>
    </Card>
  );
}
