"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RefreshCw, Radio, CircleDot, CircleOff, Wrench, MapPin, X, ExternalLink, Navigation } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { BayBar } from "@/components/ui/bay-bar";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { STATIONS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { cn, timeAgo } from "@/lib/utils";
import type { Station, StationStatus } from "@/lib/types";

const NetworkMap = dynamic(() => import("@/components/dashboard/network-map"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[13px] text-faint">Loading map…</div>,
});

const TONE: Record<StationStatus, "success" | "danger" | "warn" | "neutral"> = {
  online: "success", offline: "danger", maintenance: "warn", unknown: "neutral",
};

type Filter = "all" | "online" | "offline" | "maintenance";

export default function MapPage() {
  const { user } = useSession();
  const all = user.orgId ? STATIONS.filter((s) => s.orgId === user.orgId) : STATIONS;
  const [filter, setFilter] = useState<Filter>("all");
  // Pre-select the first station so the detail panel is never empty.
  const [selected, setSelected] = useState<Station | null>(() => all[0] ?? null);
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const counts = {
    all: all.length,
    online: all.filter((s) => s.status === "online").length,
    offline: all.filter((s) => s.status === "offline").length,
    maintenance: all.filter((s) => s.status === "maintenance").length,
  };
  const shown = useMemo(() => (filter === "all" ? all : all.filter((s) => s.status === filter)), [all, filter]);

  return (
    <div>
      <PageHeader
        breadcrumb="Network"
        title="Network map"
        subtitle="Live status of all battery-swapping stations"
        actions={<Button variant="secondary" size="lg"><RefreshCw className="h-4 w-4" /> Refresh</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Radio className="h-5 w-5" />} label="Stations" value={counts.all} sub="Total stations" tone="brand" />
        <KpiCard icon={<CircleDot className="h-5 w-5" />} label="Online" value={counts.online} sub="Stations online" tone="success" />
        <KpiCard icon={<CircleOff className="h-5 w-5" />} label="Offline" value={counts.offline} sub="Stations offline" tone="danger" />
        <KpiCard icon={<Wrench className="h-5 w-5" />} label="Maintenance" value={counts.maintenance} sub="Under maintenance" tone="warn" />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {([["all", "All"], ["online", "Online"], ["offline", "Offline"], ["maintenance", "Maintenance"]] as [Filter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors",
              filter === key ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            {label} <span className={cn("nums", filter === key ? "text-white/80" : "text-faint")}>{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden p-2">
          <div className="h-[460px] w-full">
            <NetworkMap stations={shown} onSelect={setSelected} />
          </div>
        </Card>

        <Card className="p-5">
          {selected ? (
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Station details</h3>
                <button onClick={() => setSelected(null)} className="text-faint hover:text-ink"><X className="h-4 w-4" /></button>
              </div>
              <p className="nums mt-3 text-[16px] font-bold text-ink">{selected.code}</p>
              <div className="mt-1 flex items-center gap-2">
                <StatusPill tone={TONE[selected.status]}>{selected.status[0].toUpperCase() + selected.status.slice(1)}</StatusPill>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted"><MapPin className="h-3.5 w-3.5 text-faint" />{selected.location}</p>

              <dl className="mt-4 space-y-3 text-[13px]">
                <Row label="Last seen" value={timeAgo(selected.lastSeen)} />
                <Row label="Organisation" value={orgName(selected.orgId)} />
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Bays</dt>
                  <dd><BayBar full={selected.baysFull} total={selected.baysTotal} tone={selected.status === "offline" ? "offline" : "auto"} /></dd>
                </div>
                <Row label="Faults" value={String(selected.faults)} danger={selected.faults > 0} />
              </dl>

              <div className="mt-5 flex gap-2">
                <Link href={`/stations/${selected.id}`} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 text-[13px] font-semibold text-white hover:bg-brand-700">
                  Open station <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-canvas">
                  <Navigation className="h-3.5 w-3.5" /> Directions
                </a>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><MapPin className="h-6 w-6" /></span>
              <p className="mt-3 text-[14px] font-semibold text-ink">Select a station</p>
              <p className="mt-1 text-[13px] text-muted">Click a pin on the map to see its live details.</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex items-center gap-2 px-5 pt-5">
          <Radio className="h-4 w-4 text-brand-600" />
          <h3 className="text-[15px] font-semibold text-ink">Stations near view</h3>
          <span className="text-[13px] text-muted">· Showing all {shown.length} stations</span>
        </div>
        <div className="mt-4">
          <Table>
            <THead>
              <TH>Station</TH><TH>Organisation</TH><TH>Location</TH><TH>Status</TH><TH>Bays</TH><TH>Last seen</TH><TH align="right">Faults</TH><TH align="right">Action</TH>
            </THead>
            <TBody>
              {shown.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <button onClick={() => setSelected(s)} className="text-[14px] font-semibold text-ink hover:text-brand-600">{s.name}</button>
                    <p className="nums text-[12px] text-faint">{s.code}</p>
                  </TD>
                  <TD className="font-medium">{orgName(s.orgId)}</TD>
                  <TD>{s.location}</TD>
                  <TD><StatusPill tone={TONE[s.status]}>{s.status[0].toUpperCase() + s.status.slice(1)}</StatusPill></TD>
                  <TD><BayBar full={s.baysFull} total={s.baysTotal} tone={s.status === "offline" ? "offline" : "auto"} /></TD>
                  <TD>{timeAgo(s.lastSeen)}</TD>
                  <TD align="right" className="nums font-semibold"><span className={s.faults > 0 ? "text-danger" : "text-muted"}>{s.faults}</span></TD>
                  <TD align="right">
                    <Link href={`/stations/${s.id}`} className="inline-flex h-8 items-center gap-1 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-canvas">Open <ExternalLink className="h-3 w-3" /></Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("font-semibold", danger ? "text-danger" : "text-ink")}>{value}</dd>
    </div>
  );
}
