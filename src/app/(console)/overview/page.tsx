"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  BatteryCharging,
  Bike,
  CalendarDays,
  Package,
  RefreshCw,
  Radio,
  ArrowLeftRight,
  TriangleAlert,
  Users,
  Gauge,
  HeartPulse,
  ChevronDown,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Donut } from "@/components/dashboard/donut";
import { SwapActivityChart } from "@/components/dashboard/swap-activity-chart";
import { SlotOccupancy } from "@/components/dashboard/slot-occupancy";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StationsTable } from "@/components/dashboard/stations-table";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import {
  KPIS,
  STATION_STATUS_BREAKDOWN,
  BATTERY_STATUS_BREAKDOWN,
} from "@/lib/mock";
import { useSession } from "@/lib/session";

const RANGES = [
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
] as const;

export default function OverviewPage() {
  const { user } = useSession();
  const { show } = useToast();
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[0]);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      show("Overview refreshed", { description: "Showing the latest network data." });
    }, 700);
  }

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Live view of your EV battery swapping network"
        actions={
          <>
            <div className="relative">
              <button
                onClick={() => setRangeOpen((o) => !o)}
                className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[13px] font-medium text-muted hover:border-black/15"
              >
                <CalendarDays className="h-4 w-4" /> {range.label}
                <ChevronDown className="h-4 w-4 text-faint" />
              </button>
              {rangeOpen ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRangeOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-pop">
                    {RANGES.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => { setRange(r); setRangeOpen(false); show("Date range updated", { description: r.label, tone: "info" }); }}
                        className={cn("flex w-full items-center justify-between px-3.5 py-2 text-left text-[13px] hover:bg-canvas", r.key === range.key ? "font-semibold text-ink" : "text-muted")}
                      >
                        {r.label}
                        {r.key === range.key ? <Check className="h-4 w-4 text-brand-600" /> : null}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
            <StatusPill tone="success" className="h-10 px-3.5">Live</StatusPill>
            <Button variant="secondary" size="lg" onClick={refresh} disabled={refreshing}>
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <KpiCard icon={<Radio className="h-5 w-5" />} label="Stations" value={KPIS.stations.total} sub={KPIS.stations.sub} tone="brand" />
        <KpiCard icon={<Users className="h-5 w-5" />} label="Riders" value={KPIS.riders.total} sub={KPIS.riders.sub} tone="info" />
        <KpiCard icon={<Bike className="h-5 w-5" />} label="Vehicles" value={KPIS.vehicles.total} sub={KPIS.vehicles.sub} tone="violet" />
        <KpiCard icon={<BatteryCharging className="h-5 w-5" />} label="Batteries" value={KPIS.batteries.total} sub={KPIS.batteries.sub} tone="success" />
        <KpiCard icon={<Package className="h-5 w-5" />} label="Packs Ready" value={KPIS.packsReady.total} sub={KPIS.packsReady.sub} tone="brand" />
        <KpiCard icon={<ArrowLeftRight className="h-5 w-5" />} label="Active Swaps" value={KPIS.activeSwaps.total} sub={KPIS.activeSwaps.sub} tone="info" />
        <KpiCard icon={<TriangleAlert className="h-5 w-5" />} label="Alerts" value={KPIS.alerts.total} sub={KPIS.alerts.sub} tone="danger" />
      </div>

      {/* Distribution row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader icon={<Gauge className="h-5 w-5" />} title="Station Status" subtitle="Current status distribution across all stations" />
          <div className="p-5">
            <Donut data={STATION_STATUS_BREAKDOWN} centerValue={21} centerLabel="Stations" />
          </div>
        </Card>
        <Card>
          <CardHeader icon={<HeartPulse className="h-5 w-5" />} title="Battery Status" subtitle="Health distribution of all batteries" />
          <div className="p-5">
            <Donut data={BATTERY_STATUS_BREAKDOWN} centerValue={160} centerLabel="Batteries" />
          </div>
        </Card>
        <Card>
          <CardHeader icon={<Gauge className="h-5 w-5" />} title="Slot Occupancy" subtitle="Total slots across all stations" />
          <div className="p-5">
            <SlotOccupancy />
          </div>
        </Card>
      </div>

      {/* Activity row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<Activity className="h-5 w-5" />}
            title="Swap Activity"
            subtitle="Total swaps per hour"
            action={
              <div className="flex items-center gap-4 pr-1 text-[12px]">
                <Legend color="#16A34A" label="Completed" value={146} />
                <Legend color="#F59E0B" label="Battery Returned" value={11} />
                <Legend color="#DC2626" label="Failed" value={28} />
              </div>
            }
          />
          <div className="p-5 pt-3">
            <SwapActivityChart />
          </div>
        </Card>
        <Card>
          <CardHeader
            icon={<Activity className="h-5 w-5" />}
            title="Recent Activity"
            action={<Link href="/swaps" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700">View all</Link>}
          />
          <div className="px-3 py-3">
            <RecentActivity />
          </div>
        </Card>
      </div>

      {/* Stations table */}
      <Card className="mt-4">
        <CardHeader
          icon={<Radio className="h-5 w-5" />}
          title="Stations"
          subtitle={user.orgId ? "Live status of your stations" : "Live status of all stations"}
        />
        <div className="pt-4">
          <StationsTable />
        </div>
      </Card>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5 text-muted">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label} <span className="nums font-semibold text-ink">{value}</span>
    </span>
  );
}
