"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RefreshCw, Radio, CircleDot, CircleOff, Wrench, MapPin, X, ExternalLink, Navigation, Search, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { BayBar } from "@/components/ui/bay-bar";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { STATIONS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { cn, exportCsv } from "@/lib/utils";
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
  const { user, can } = useSession();
  const { show } = useToast();
  const all = user.orgId ? STATIONS.filter((s) => s.orgId === user.orgId) : STATIONS;
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  // Pre-select the first station so the detail panel is never empty.
  const [selected, setSelected] = useState<Station | null>(() => all[0] ?? null);
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  // Org + search narrows the set; the status tabs filter on top of that.
  const preStatus = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((s) => {
      if (q && !`${s.name} ${s.code} ${s.location}`.toLowerCase().includes(q)) return false;
      if (orgFilter !== "all" && orgName(s.orgId) !== orgFilter) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, query, orgFilter]);

  const counts = {
    all: preStatus.length,
    online: preStatus.filter((s) => s.status === "online").length,
    offline: preStatus.filter((s) => s.status === "offline").length,
    maintenance: preStatus.filter((s) => s.status === "maintenance").length,
  };
  const shown = useMemo(() => (filter === "all" ? preStatus : preStatus.filter((s) => s.status === filter)), [preStatus, filter]);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Map refreshed", { description: "Station positions and status are current." }); }, 700);
  }

  function handleExport() {
    exportCsv(
      "stations-map.csv",
      ["Station", "Code", "Organisation", "Location", "Latitude", "Longitude", "Status", "Bays full", "Bays total", "Faults"],
      shown.map((s) => [s.name, s.code, orgName(s.orgId), s.location, s.lat, s.lng, s.status, s.baysFull, s.baysTotal, s.faults]),
    );
    show("Stations exported", { description: `${shown.length} ${shown.length === 1 ? "row" : "rows"} · stations-map.csv` });
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Network"
        title="Network map"
        subtitle="Live status of all battery-swapping stations"
        actions={
          <Button variant="secondary" size="lg" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Radio className="h-5 w-5" />} label="Stations" value={counts.all} sub="Total stations" tone="brand" />
        <KpiCard icon={<CircleDot className="h-5 w-5" />} label="Online" value={counts.online} sub="Stations online" tone="success" />
        <KpiCard icon={<CircleOff className="h-5 w-5" />} label="Offline" value={counts.offline} sub="Stations offline" tone="danger" />
        <KpiCard icon={<Wrench className="h-5 w-5" />} label="Maintenance" value={counts.maintenance} sub="Under maintenance" tone="warn" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
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

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stations…"
              className="h-9 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-[13px] placeholder:text-faint focus:border-brand-300 focus:outline-none"
            />
          </div>
          {can("view_all_orgs") ? (
            <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className="h-9 rounded-xl border border-line bg-surface px-3 text-[13px] text-ink">
              <option value="all">All organisations</option>
              {ORGS.map((o) => (<option key={o.id} value={o.name}>{o.name}</option>))}
            </select>
          ) : null}
          <Button variant="secondary" size="sm" onClick={handleExport}><Download className="h-4 w-4" /> Export</Button>
        </div>
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
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink/[0.045] text-muted"><MapPin className="h-6 w-6" /></span>
              <p className="mt-3 text-[14px] font-semibold text-ink">Select a station</p>
              <p className="mt-1 text-[13px] text-muted">Click a pin on the map to see its live details.</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex items-center gap-2 px-5 pt-5">
          <Radio className="h-4 w-4 text-muted" />
          <h3 className="text-[15px] font-semibold text-ink">Stations in view</h3>
          <span className="text-[13px] text-muted">· {shown.length} {shown.length === 1 ? "station" : "stations"}</span>
        </div>
        <div className="mt-4">
          <Table>
            <THead>
              <TH>Station</TH><TH>Organisation</TH><TH>Location</TH><TH>Status</TH><TH>Bays</TH><TH align="right">Faults</TH><TH align="right">Action</TH>
            </THead>
            <TBody>
              {shown.length === 0 ? (
                <TR><TD className="py-10 text-center text-muted">No stations match your filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /></TR>
              ) : shown.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <button onClick={() => setSelected(s)} className="text-[14px] font-semibold text-ink hover:text-brand-600">{s.name}</button>
                    <p className="nums text-[12px] text-faint">{s.code}</p>
                  </TD>
                  <TD className="font-medium">{orgName(s.orgId)}</TD>
                  <TD>{s.location}</TD>
                  <TD><StatusPill tone={TONE[s.status]}>{s.status[0].toUpperCase() + s.status.slice(1)}</StatusPill></TD>
                  <TD><BayBar full={s.baysFull} total={s.baysTotal} tone={s.status === "offline" ? "offline" : "auto"} /></TD>
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
