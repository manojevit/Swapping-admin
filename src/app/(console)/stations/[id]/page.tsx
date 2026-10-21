"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound, useRouter } from "next/navigation";
import {
  QrCode, FileDown, Pencil, Activity, Package, Zap, TriangleAlert, ChevronRight, MapPin, Building2,
  Map as MapIcon, CalendarDays, Wifi, HeartPulse, ArrowRight, Check, CheckCheck, Navigation, Cpu, ArrowLeftRight, Power, Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BayCard } from "@/components/dashboard/bay-card";
import { StationControls } from "@/components/dashboard/station-controls";
import { QrModal, BmsModal } from "@/components/dashboard/station-modals";
import { StationLocationPicker } from "@/components/dashboard/station-location-picker";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { useToast } from "@/components/ui/toast";
import { getStationDetail, ORGS, SWAPS, ALERTS, SWAP_ACTIVITY } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { cn, timeAgo } from "@/lib/utils";
import type { StationStatus, SwapOutcome, AlertSeverity, Bay } from "@/lib/types";

type AlertState = "open" | "acknowledged" | "resolved";

const NetworkMap = dynamic(() => import("@/components/dashboard/network-map"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[12px] text-faint">Loading map…</div>,
});

const TONE: Record<StationStatus, "success" | "danger" | "warn" | "neutral"> = {
  online: "success", offline: "danger", maintenance: "warn", unknown: "neutral",
};
const OUTCOME: Record<SwapOutcome, { tone: "success" | "warn" | "danger" | "info"; label: string }> = {
  completed: { tone: "success", label: "Completed" },
  battery_returned: { tone: "warn", label: "Returned" },
  failed: { tone: "danger", label: "Failed" },
  running: { tone: "info", label: "Running" },
};
const SEV: Record<AlertSeverity, "danger" | "warn" | "info"> = { critical: "danger", warning: "warn", info: "info" };

export default function StationDetailPage({ params }: { params: { id: string } }) {
  const { can } = useSession();
  const { show } = useToast();
  const router = useRouter();
  const station = getStationDetail(params.id);
  const [tab, setTab] = useState<"overview" | "controls">("overview");
  const [qrOpen, setQrOpen] = useState(false);
  const [bmsBay, setBmsBay] = useState<Bay | null>(null);
  const [alertStates, setAlertStates] = useState<Record<string, AlertState>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!station) notFound();

  const bays = station.bays;
  const charged = bays.filter((b) => b.state === "charged").length;
  const charging = bays.filter((b) => b.state === "charging").length;
  const empty = bays.filter((b) => b.state === "empty").length;
  const faulted = bays.filter((b) => b.state === "faulted").length;
  const usable = charged + charging;
  const orgName = ORGS.find((o) => o.id === station.orgId)?.name ?? "—";
  const showControls = can("run_station_controls");

  // Section data
  const recentSwaps = SWAPS.filter((s) => s.stationCode === station.code).slice(0, 5);
  const stationAlerts = ALERTS.filter((a) => a.sourceLabel === station.code);
  const throughput = SWAP_ACTIVITY.map((p) => ({ hour: p.hour, swaps: Math.max(0, Math.round(p.completed / 5)) }));
  const swaps24h = throughput.reduce((a, p) => a + p.swaps, 0);

  const uptimePct = station.status === "online" ? 99.2 : station.status === "maintenance" ? 94.3 : 58.7;
  const segments = Array.from({ length: 24 }, (_, i) =>
    station.status === "online" ? i !== 18 : station.status === "maintenance" ? !(i >= 9 && i <= 13) : i < 14,
  );

  const sohVals = bays.map((b) => b.soh).filter((v): v is number => v != null);
  const sohHealthy = sohVals.filter((v) => v >= 85).length;
  const sohAging = sohVals.filter((v) => v >= 70 && v < 85).length;
  const sohRetire = sohVals.filter((v) => v < 70).length;
  const avgSoh = sohVals.length ? Math.round(sohVals.reduce((a, b) => a + b, 0) / sohVals.length) : 0;

  const firmwareOutdated = station.firmware !== station.firmwareLatest;

  function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted">
        <Link href="/overview" className="hover:text-ink">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5 text-faint" />
        <Link href="/stations" className="hover:text-ink">Stations</Link>
        <ChevronRight className="h-3.5 w-3.5 text-faint" />
        <span className="nums font-medium text-ink">{station.code}</span>
      </nav>

      {/* Title row */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="nums text-[26px] font-semibold leading-tight tracking-tight text-ink">{station.code}</h1>
            <StatusPill tone={TONE[station.status]}>{station.status[0].toUpperCase() + station.status.slice(1)}</StatusPill>
          </div>
          <p className="mt-1 max-w-3xl text-[14px] text-muted">{station.name} · {station.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setQrOpen(true)}><QrCode className="h-4 w-4" /> QR</Button>
          <Button variant="secondary" onClick={() => setQrOpen(true)}><FileDown className="h-4 w-4" /> SVG</Button>
          {can("manage_stations") ? (
            <FormDialog
              icon={<Pencil className="h-5 w-5" />}
              trigger={<><Pencil className="h-4 w-4" /> Edit station</>}
              title={`Edit ${station.code}`}
              description="Update station details."
              submitLabel="Save changes"
            >
              <Field label="Display name" defaultValue={station.name} required />
              <Field label="Location" defaultValue={station.location} required />
              <Field label="Address" defaultValue={station.address} />
              <StationLocationPicker initialLat={station.lat} initialLng={station.lng} />
              <SelectField label="Status" options={["Online", "Offline", "Maintenance"]} defaultValue={station.status[0].toUpperCase() + station.status.slice(1)} required />
            </FormDialog>
          ) : null}
          {can("manage_stations") ? (
            <>
              <Button variant="secondary" onClick={() => show("Station decommissioned", { description: `${station.code} taken offline`, tone: "warn" })}><Power className="h-4 w-4" /> Decommission</Button>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
            </>
          ) : null}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Activity className="h-5 w-5" />} label="Station status" value={station.status[0].toUpperCase() + station.status.slice(1)} sub={`Seen ${timeAgo(station.lastSeen)}`} tone={station.status === "online" ? "success" : station.status === "maintenance" ? "warn" : "danger"} />
        <KpiCard icon={<Package className="h-5 w-5" />} label="Ready to hand out" value={charged} sub={`${usable} usable of ${bays.length}`} tone="brand" />
        <KpiCard icon={<Zap className="h-5 w-5" />} label="Charging" value={charging} sub={`${empty} empty`} tone="warn" />
        <KpiCard icon={<ArrowLeftRight className="h-5 w-5" />} label="Swaps (24h)" value={swaps24h} sub={`${faulted} faulted ${faulted === 1 ? "bay" : "bays"}`} tone="info" />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 border-b border-line">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>Overview</TabBtn>
        {showControls ? <TabBtn active={tab === "controls"} onClick={() => setTab("controls")}>Controls</TabBtn> : null}
      </div>

      {tab === "overview" ? (
        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.9fr_1fr]">
          {/* LEFT */}
          <div className="space-y-3">
            {/* Bays */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-ink">Bays <span className="text-faint">({bays.length})</span></h3>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted">
                  <Legend color="bg-success" label="Ready" />
                  <Legend color="bg-warn" label="Charging" />
                  <Legend color="bg-black/20" label="Empty" />
                  <Legend color="bg-danger" label="Faulted" />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {bays.map((b) => (<BayCard key={b.index} bay={b} onBms={setBmsBay} />))}
              </div>
              <p className="mt-3 border-t border-line pt-2.5 text-[12px] leading-relaxed text-faint">
                There is no CLOSE command in this system — the lock is fail-secure and the rider pushes the flap shut by hand. A bay that will not close is a physical problem, not a missing button.
              </p>
            </Card>

            {/* Throughput */}
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-ink">Throughput</h3>
                <span className="text-[12px] text-muted">Swaps per hour · last 24h</span>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={throughput} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F6" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9AA4B2" }} tickLine={false} axisLine={false} interval={5} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7EBF1", fontSize: 12 }} cursor={{ fill: "rgba(30,99,240,0.06)" }} />
                  <Bar dataKey="swaps" fill="#1E63F0" radius={[4, 4, 0, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Recent swaps */}
            <Card>
              <div className="flex items-center justify-between px-4 pt-4">
                <h3 className="text-[14px] font-semibold text-ink">Recent swaps</h3>
                <Link href="/swaps" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700">View all</Link>
              </div>
              <div className="mt-2.5">
                {recentSwaps.length === 0 ? (
                  <p className="px-4 pb-4 text-[13px] text-muted">No swaps recorded at this station yet.</p>
                ) : (
                  <Table>
                    <THead><TH>When</TH><TH>Rider</TH><TH>Bays</TH><TH>Pack out</TH><TH align="right">Outcome</TH></THead>
                    <TBody>
                      {recentSwaps.map((s) => {
                        const o = OUTCOME[s.outcome];
                        return (
                          <TR key={s.id}>
                            <TD className="text-ink">{fmt(s.startedAt)}</TD>
                            <TD>{s.riderName}</TD>
                            <TD><span className="nums inline-flex items-center gap-1 text-ink">{s.bayIn}<ArrowRight className="h-3 w-3 text-faint" />{s.bayOut}</span></TD>
                            <TD><span className="nums text-ink">{s.tookOutBattery}</span> <span className="nums text-faint">· {s.tookOutSoc}%</span></TD>
                            <TD align="right"><StatusPill tone={o.tone}>{o.label}</StatusPill></TD>
                          </TR>
                        );
                      })}
                    </TBody>
                  </Table>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-3">
            {/* Uptime & connectivity */}
            <Card className="p-4">
              <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-brand-600" /><h3 className="text-[13px] font-semibold text-ink">Uptime &amp; connectivity</h3></div>
              <p className="nums mt-2 text-[22px] font-bold leading-none text-ink">{uptimePct}%</p>
              <p className="mt-1 text-[12px] text-faint">Last heartbeat {timeAgo(station.lastSeen)}</p>
              <div className="mt-2.5 flex items-end gap-[3px]">
                {segments.map((up, i) => (
                  <span key={i} className={cn("h-5 flex-1 rounded-[2px]", up ? "bg-success/70" : "bg-danger/70")} title={`${String(i).padStart(2, "0")}:00`} />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-faint">Hourly, last 24h</p>
            </Card>

            {/* Open alerts */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><TriangleAlert className="h-4 w-4 text-brand-600" /><h3 className="text-[13px] font-semibold text-ink">Open alerts</h3></div>
                {stationAlerts.length > 0 ? <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger-ink">{stationAlerts.length}</span> : null}
              </div>
              {stationAlerts.length === 0 ? (
                <div className="mt-3 flex items-center gap-2 text-[13px] text-success-ink">
                  <CheckCheck className="h-4 w-4" /> No open alerts — all clear.
                </div>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {stationAlerts.map((a) => {
                    const state = alertStates[a.id] ?? "open";
                    return (
                      <li key={a.id} className="rounded-xl border border-line p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold text-ink">{a.title}</p>
                          {state === "resolved" ? (
                            <StatusPill tone="success">Resolved</StatusPill>
                          ) : state === "acknowledged" ? (
                            <StatusPill tone="info">Acknowledged</StatusPill>
                          ) : (
                            <StatusPill tone={SEV[a.severity]}>{a.severity[0].toUpperCase() + a.severity.slice(1)}</StatusPill>
                          )}
                        </div>
                        <p className="mt-0.5 text-[12px] text-muted">{a.detail}</p>
                        {can("manage_alerts") && state !== "resolved" ? (
                          <div className="mt-2 flex gap-1.5">
                            <Button variant="secondary" size="sm" disabled={state === "acknowledged"} onClick={() => { setAlertStates((s) => ({ ...s, [a.id]: "acknowledged" })); show("Alert acknowledged", { description: a.title, tone: "info" }); }}>
                              <Check className="h-3.5 w-3.5" /> Ack
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => { setAlertStates((s) => ({ ...s, [a.id]: "resolved" })); show("Alert resolved", { description: a.title }); }}>
                              Resolve
                            </Button>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Battery health */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-brand-600" /><h3 className="text-[13px] font-semibold text-ink">Pack health (SoH)</h3></div>
                <span className="nums text-[13px] font-semibold text-ink">avg {avgSoh}%</span>
              </div>
              <div className="mt-3 space-y-2.5">
                <SohRow color="bg-success" label="Healthy ≥ 85%" value={sohHealthy} total={sohVals.length} />
                <SohRow color="bg-warn" label="Aging 70–84%" value={sohAging} total={sohVals.length} />
                <SohRow color="bg-danger" label="Retire < 70%" value={sohRetire} total={sohVals.length} />
              </div>
            </Card>

            {/* Location */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2"><MapIcon className="h-4 w-4 text-brand-600" /><h3 className="text-[13px] font-semibold text-ink">Location</h3></div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700">
                  <Navigation className="h-3.5 w-3.5" /> Directions
                </a>
              </div>
              <div className="mt-2.5 h-[150px] w-full px-2.5 pb-2.5">
                <NetworkMap stations={[station]} />
              </div>
            </Card>

            {/* Station information */}
            <Card className="p-4">
              <h3 className="text-[13px] font-semibold text-ink">Station information</h3>
              <div className="mt-3 space-y-3">
                <Info icon={<MapPin className="h-4 w-4" />} label="Address" value={station.address} />
                <Info icon={<Building2 className="h-4 w-4" />} label="Organisation" value={orgName} />
                <Info icon={<CalendarDays className="h-4 w-4" />} label="Installed on" value={station.installedOn} />
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><Cpu className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-faint">Firmware</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[13px] text-ink">
                      <span className="nums">{station.firmware}</span>
                      {firmwareOutdated ? (
                        <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-semibold text-warn-ink">{station.firmwareLatest} available</span>
                      ) : (
                        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-ink">Up to date</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="mt-5"><StationControls station={station} /></div>
      )}

      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} station={station} />
      <BmsModal open={bmsBay !== null} onClose={() => setBmsBay(null)} bay={bmsBay} stationCode={station.code} />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { show("Station deleted", { description: station.code, tone: "warn" }); router.push("/stations"); }}
        title={`Delete ${station.code}?`}
        description="This removes the station and unlinks its bays and command history."
        confirmLabel="Delete station"
      >
        <p className="text-[13px] text-muted">Prefer <span className="font-semibold text-ink">Decommission</span> if you only need to take it offline — that keeps its swap history. Delete cannot be undone.</p>
      </ConfirmDialog>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-4 py-2.5 text-[14px] font-semibold transition-colors",
        active ? "border-brand-600 text-brand-600" : "border-transparent text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}

function SohRow({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="text-muted">{label}</span>
        <span className="nums font-semibold text-ink">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-faint">{label}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-ink">{value}</p>
      </div>
    </div>
  );
}
