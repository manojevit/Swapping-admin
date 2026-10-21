"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QrCode, FileDown, Pencil, Activity, Package, Zap, TriangleAlert, ChevronRight, MapPin, Building2, Map as MapIcon, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BayCard } from "@/components/dashboard/bay-card";
import { StationControls } from "@/components/dashboard/station-controls";
import { getStationDetail, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { StationStatus } from "@/lib/types";

const TONE: Record<StationStatus, "success" | "danger" | "warn" | "neutral"> = {
  online: "success", offline: "danger", maintenance: "warn", unknown: "neutral",
};

export default function StationDetailPage({ params }: { params: { id: string } }) {
  const { can } = useSession();
  const station = getStationDetail(params.id);
  const [tab, setTab] = useState<"bays" | "controls">("bays");

  if (!station) notFound();

  const bays = station.bays;
  const charged = bays.filter((b) => b.state === "charged").length;
  const charging = bays.filter((b) => b.state === "charging").length;
  const empty = bays.filter((b) => b.state === "empty").length;
  const faulted = bays.filter((b) => b.state === "faulted").length;
  const usable = charged + charging;
  const orgName = ORGS.find((o) => o.id === station.orgId)?.name ?? "—";
  const showControls = can("run_station_controls");

  function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
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
          <Button variant="secondary"><QrCode className="h-4 w-4" /> QR</Button>
          <Button variant="secondary"><FileDown className="h-4 w-4" /> SVG</Button>
          {can("manage_stations") ? <Button variant="primary"><Pencil className="h-4 w-4" /> Edit station</Button> : null}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Activity className="h-5 w-5" />} label="Station status" value={station.status[0].toUpperCase() + station.status.slice(1)} sub={fmt(station.lastSeen)} tone={station.status === "online" ? "success" : station.status === "maintenance" ? "warn" : "danger"} />
        <KpiCard icon={<Package className="h-5 w-5" />} label="Ready to hand out" value={charged} sub={`${usable} usable of ${bays.length}`} tone="brand" />
        <KpiCard icon={<Zap className="h-5 w-5" />} label="Charging" value={charging} sub={`${empty} empty`} tone="warn" />
        <KpiCard icon={<TriangleAlert className="h-5 w-5" />} label="Faulted bays" value={faulted} sub={faulted > 0 ? "need attention" : "none"} tone={faulted > 0 ? "danger" : "neutral"} />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 border-b border-line">
        <TabBtn active={tab === "bays"} onClick={() => setTab("bays")}>Bays &amp; info</TabBtn>
        {showControls ? <TabBtn active={tab === "controls"} onClick={() => setTab("controls")}>Controls</TabBtn> : null}
      </div>

      <div className="mt-5">
        {tab === "bays" ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.9fr_1fr]">
            {/* Bays grid */}
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-ink">Bays <span className="text-faint">({bays.length})</span></h3>
                <div className="flex flex-wrap items-center gap-3.5 text-[12px] text-muted">
                  <Legend color="bg-success" label="Ready" />
                  <Legend color="bg-warn" label="Charging" />
                  <Legend color="bg-black/20" label="Empty" />
                  <Legend color="bg-danger" label="Faulted" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {bays.map((b) => (
                  <BayCard key={b.index} bay={b} />
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
                There is no CLOSE command in this system — the lock is fail-secure and the rider pushes the flap shut by hand. A bay that will not close is a physical problem, not a missing button.
              </p>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4">
              {station.lastSwap ? (
                <Card className="p-5">
                  <h3 className="text-[13px] font-semibold text-ink">Last swap</h3>
                  <p className="nums mt-2 text-[13px] text-muted">
                    <span className="font-semibold text-success-ink">Completed</span> · bay {station.lastSwap.bayIn} in / {station.lastSwap.bayOut} out
                  </p>
                  <p className="nums mt-0.5 truncate text-[12px] text-faint">{station.lastSwap.id}</p>
                  <p className="mt-1 text-[12px] text-faint">{fmt(station.lastSwap.startedAt)} · station free for the next rider.</p>
                  <Button variant="secondary" size="sm" className="mt-3 w-full">View swap details</Button>
                </Card>
              ) : null}

              <Card className="p-5">
                <h3 className="text-[13px] font-semibold text-ink">Station information</h3>
                <div className="mt-3 space-y-3.5">
                  <Info icon={<MapPin className="h-4 w-4" />} label="Address" value={station.address} />
                  <Info icon={<Building2 className="h-4 w-4" />} label="Organisation" value={orgName} />
                  <Info icon={<MapIcon className="h-4 w-4" />} label="Location ID" value={station.locationId} />
                  <Info icon={<CalendarDays className="h-4 w-4" />} label="Installed on" value={station.installedOn} />
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <StationControls station={station} />
        )}
      </div>
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
