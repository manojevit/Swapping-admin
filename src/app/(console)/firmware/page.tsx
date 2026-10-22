"use client";

import { useMemo, useState } from "react";
import { CircleCheck, ArrowUpCircle, RefreshCw, Download, UploadCloud, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/layout/no-access";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { FormDialog, Field } from "@/components/ui/form-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/lib/session";
import { FIRMWARE_LATEST, FIRMWARE_VERSIONS, STATION_FIRMWARE, type StationFirmware } from "@/lib/mock";
import { cn, exportCsv, timeAgo } from "@/lib/utils";

type State = "up_to_date" | "update_available" | "updating" | "offline";

function stateOf(s: StationFirmware): State {
  if (!s.version) return "offline";
  if (s.updatingTo) return "updating";
  return s.version === FIRMWARE_LATEST ? "up_to_date" : "update_available";
}

export default function FirmwarePage() {
  const { can } = useSession();
  const { show } = useToast();
  const [needsOnly, setNeedsOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const upToDate = useMemo(() => STATION_FIRMWARE.filter((s) => stateOf(s) === "up_to_date").length, []);
  const needUpdate = useMemo(() => STATION_FIRMWARE.filter((s) => stateOf(s) === "update_available").length, []);
  const updating = useMemo(() => STATION_FIRMWARE.filter((s) => stateOf(s) === "updating").length, []);

  const rows = useMemo(
    () => (needsOnly ? STATION_FIRMWARE.filter((s) => stateOf(s) === "update_available") : STATION_FIRMWARE),
    [needsOnly],
  );

  if (!can("manage_firmware"))
    return <NoAccess title="Firmware" subtitle="Keep every station on the latest software." />;

  function updateOne(s: StationFirmware) {
    show("Update started", { description: `${s.stationCode} → version ${FIRMWARE_LATEST}` });
  }
  function updateAll() {
    if (needUpdate === 0) { show("Everything is up to date", { description: "No station needs an update.", tone: "info" }); return; }
    show("Updating all stations that are behind", { description: `${needUpdate} ${needUpdate === 1 ? "station" : "stations"} → version ${FIRMWARE_LATEST}` });
  }
  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Checked all stations"); }, 700);
  }
  function exportCsvFile() {
    exportCsv(
      "station-firmware.csv",
      ["Station", "Name", "Organisation", "Version", "Status", "Last updated"],
      STATION_FIRMWARE.map((s) => [
        s.stationCode, s.stationName, s.orgName, s.version ?? "—",
        ({ up_to_date: "Up to date", update_available: "Update available", updating: "Updating", offline: "Offline" } as const)[stateOf(s)],
        new Date(s.lastUpdated).toISOString(),
      ]),
    );
    show("Exported", { description: `${STATION_FIRMWARE.length} stations · station-firmware.csv` });
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Admin / Firmware"
        title="Firmware"
        subtitle="Keep every station on the latest software."
        actions={<UploadDialog />}
      />

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi icon={<Sparkles className="h-5 w-5" />} label="Latest version" value={FIRMWARE_LATEST} sub={`Released ${timeAgo(FIRMWARE_VERSIONS[0].releasedAt)}`} tone="neutral" />
        <Kpi icon={<CircleCheck className="h-5 w-5" />} label="Up to date" value={String(upToDate)} sub="Stations on the latest" tone="success" />
        <Kpi icon={<ArrowUpCircle className="h-5 w-5" />} label="Update available" value={String(needUpdate)} sub="Stations behind" tone="warn" />
        <Kpi icon={<RefreshCw className="h-5 w-5" />} label="Updating now" value={String(updating)} sub="Installing in the background" tone="neutral" />
      </div>

      {/* Station software */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Station software</h3>
            <p className="text-[13px] text-muted">Which version each station is running.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted">
              <input type="checkbox" checked={needsOnly} onChange={(e) => setNeedsOnly(e.target.checked)} className="h-4 w-4 rounded border-line accent-brand-600" />
              Needs update only
            </label>
            <Button variant="secondary" size="sm" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Refresh</Button>
            <Button variant="secondary" size="sm" onClick={exportCsvFile}><Download className="h-3.5 w-3.5" /> Export</Button>
            <Button variant="primary" size="sm" onClick={updateAll} disabled={needUpdate === 0}><ArrowUpCircle className="h-3.5 w-3.5" /> Update all behind{needUpdate ? ` (${needUpdate})` : ""}</Button>
          </div>
        </div>
        <div className="mt-3">
          <Table>
            <THead>
              <TH>Station</TH><TH>Organisation</TH><TH>Version</TH><TH>Status</TH><TH>Last updated</TH><TH align="right">Action</TH>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR><TD className="py-10 text-center text-muted">Every station is on the latest version.</TD><TD /><TD /><TD /><TD /><TD /></TR>
              ) : rows.map((s) => {
                const st = stateOf(s);
                return (
                  <TR key={s.stationCode}>
                    <TD>
                      <p className="nums text-[13px] font-semibold text-ink">{s.stationCode}</p>
                      <p className="text-[12px] text-faint">{s.stationName}</p>
                    </TD>
                    <TD className="text-muted">{s.orgName}</TD>
                    <TD>
                      {s.version ? <span className="nums font-semibold text-ink">{s.version}</span> : <span className="text-faint">—</span>}
                      {st === "updating" ? (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10">
                            <div className="h-full rounded-full bg-brand-600" style={{ width: `${s.progress ?? 0}%` }} />
                          </div>
                          <span className="nums text-[11px] text-faint">→ {s.updatingTo}</span>
                        </div>
                      ) : null}
                    </TD>
                    <TD>
                      {st === "up_to_date" ? <StatusPill tone="success">Up to date</StatusPill>
                        : st === "update_available" ? <StatusPill tone="warn">Update available</StatusPill>
                        : st === "updating" ? <StatusPill tone="info">Updating {s.progress}%</StatusPill>
                        : <StatusPill tone="neutral" dot={false}>Offline</StatusPill>}
                    </TD>
                    <TD className="text-muted">{timeAgo(s.lastUpdated)}</TD>
                    <TD align="right">
                      {st === "update_available" ? (
                        <Button variant="secondary" size="sm" onClick={() => updateOne(s)}><ArrowUpCircle className="h-3.5 w-3.5" /> Update</Button>
                      ) : (
                        <span className="text-[13px] text-faint">—</span>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
          <p className="px-5 py-3 text-[12px] text-faint">Showing {rows.length} of {STATION_FIRMWARE.length} stations</p>
        </div>
      </Card>

      {/* Versions */}
      <Card>
        <div className="px-5 pt-5">
          <h3 className="text-[15px] font-semibold text-ink">Firmware versions</h3>
          <p className="text-[13px] text-muted">Every version you&rsquo;ve released, newest first.</p>
        </div>
        <div className="mt-3">
          <Table>
            <THead><TH>Version</TH><TH>Released</TH><TH>What&rsquo;s new</TH></THead>
            <TBody>
              {FIRMWARE_VERSIONS.map((v) => (
                <TR key={v.version}>
                  <TD>
                    <span className="nums font-semibold text-ink">{v.version}</span>
                    {v.latest ? <StatusPill tone="success" className="ml-2">Latest</StatusPill> : null}
                  </TD>
                  <TD className="text-muted">{timeAgo(v.releasedAt)}</TD>
                  <TD className="max-w-[460px] text-muted">{v.whatsNew}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function UploadDialog() {
  return (
    <FormDialog
      icon={<UploadCloud className="h-5 w-5" />}
      trigger={<><UploadCloud className="h-4 w-4" /> Upload new firmware</>}
      title="Upload new firmware"
      description="Add a new version. Stations can then be updated to it."
      submitLabel="Publish version"
    >
      <Field label="Version number" placeholder="e.g. 0.7.4" required hint="Use the number printed on the build, e.g. 0.7.4." />
      <Field label="What's new" placeholder="One line on what changed in this version" required />
      <Field label="Firmware file" type="file" required hint="The .bin file for this version." />
      <p className="text-[12px] text-faint">After publishing, update stations from the list — one at a time, or all behind at once.</p>
    </FormDialog>
  );
}

const _tones = { neutral: "bg-ink/[0.045] text-muted", success: "bg-success-soft text-success-ink", warn: "bg-warn-soft text-warn-ink" };

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "neutral" | "success" | "warn" }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2.5">
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", _tones[tone])}>{icon}</span>
        <span className="text-[13px] font-medium text-muted">{label}</span>
      </div>
      <p className="nums mt-3 text-[28px] font-bold leading-none text-ink">{value}</p>
      <p className="mt-2 text-[12px] text-faint">{sub}</p>
    </Card>
  );
}
