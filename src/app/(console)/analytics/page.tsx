"use client";

import { useState } from "react";
import { ArrowLeftRight, Clock, BatteryCharging, Users, TrendingUp, TrendingDown, Download, Lightbulb, TriangleAlert, IndianRupee, Wifi, BarChart3, FileText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ANALYTICS_KPIS, ANALYTICS_SUBSTATS, SWAPS_PER_DAY, STATION_PERFORMANCE, BATTERY_HEALTH_TREND, ANALYTICS_INSIGHTS,
} from "@/lib/mock";

const axis = { fontSize: 11, fill: "#9AA4B2" };
const tip = { borderRadius: 12, border: "1px solid #E7EBF1", boxShadow: "0 8px 24px rgba(16,24,40,0.12)", fontSize: 12 };

export default function AnalyticsPage() {
  const [range, setRange] = useState("30 days");
  const maxSwaps = Math.max(...STATION_PERFORMANCE.map((s) => s.swaps));

  return (
    <div>
      <PageHeader
        breadcrumb="Business / Analytics"
        title="Analytics"
        subtitle="Track swapping performance and network insights"
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
            {["30 days", "90 days", "1 year"].map((r) => (
              <button key={r} onClick={() => setRange(r)} className={cn("rounded-lg px-3 py-1.5 text-[13px] font-semibold", range === r ? "bg-brand-600 text-white" : "text-muted hover:text-ink")}>{r}</button>
            ))}
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticKpi icon={<ArrowLeftRight className="h-5 w-5" />} label="Total swaps" {...ANALYTICS_KPIS.totalSwaps} />
        <AnalyticKpi icon={<Clock className="h-5 w-5" />} label="Average dwell time" {...ANALYTICS_KPIS.avgDwell} />
        <AnalyticKpi icon={<BatteryCharging className="h-5 w-5" />} label="Battery turn rate" {...ANALYTICS_KPIS.batteryTurn} />
        <AnalyticKpi icon={<Users className="h-5 w-5" />} label="Driver retention" {...ANALYTICS_KPIS.retention} />
      </div>

      {/* Sub stats strip */}
      <Card className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3.5 text-[13px]">
        <Sub icon={<IndianRupee className="h-4 w-4" />} label="Gross revenue" value={ANALYTICS_SUBSTATS.grossRevenue} />
        <Sub icon={<Wifi className="h-4 w-4" />} label="Network uptime" value={ANALYTICS_SUBSTATS.uptime} />
        <Sub icon={<BarChart3 className="h-4 w-4" />} label="Average per day" value={String(ANALYTICS_SUBSTATS.avgPerDay)} />
        <Sub icon={<FileText className="h-4 w-4" />} label="Stations reporting" value={ANALYTICS_SUBSTATS.stationsReporting} />
      </Card>

      {/* Swaps per day */}
      <Card className="mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Swaps per day</h3>
          <div className="flex items-center gap-4 text-[12px]">
            <Lgnd color="#1E63F0" label="Completed" /><Lgnd color="#16A34A" label="Battery returned" /><Lgnd color="#DC2626" label="Failed" />
            <Button variant="secondary" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={SWAPS_PER_DAY} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F6" vertical={false} />
            <XAxis dataKey="day" tick={axis} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
            <Tooltip contentStyle={tip} />
            <Line type="monotone" dataKey="completed" stroke="#1E63F0" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="returned" stroke="#16A34A" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="failed" stroke="#DC2626" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Two-up: station performance + battery health */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-ink">Station performance</h3>
          <div className="space-y-3">
            {STATION_PERFORMANCE.map((s, i) => (
              <div key={s.name} className="grid grid-cols-[16px_1fr_auto] items-center gap-3 text-[13px]">
                <span className="nums text-faint">{i + 1}</span>
                <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/5">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(s.swaps / maxSwaps) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <span className="nums font-semibold text-ink">{s.swaps}</span>
                  <span className="nums ml-3 text-success-ink">{s.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Battery health trend</h3>
            <div className="flex items-center gap-3 text-[12px]"><Lgnd color="#16A34A" label="Healthy" /><Lgnd color="#F59E0B" label="Low charge" /><Lgnd color="#DC2626" label="Fault" /></div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BATTERY_HEALTH_TREND} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F6" vertical={false} />
              <XAxis dataKey="day" tick={axis} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="healthy" stackId="a" fill="#16A34A" />
              <Bar dataKey="low" stackId="a" fill="#F59E0B" />
              <Bar dataKey="fault" stackId="a" fill="#DC2626" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance table + insights */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <h3 className="px-5 pt-5 text-[15px] font-semibold text-ink">Performance by station</h3>
          <div className="mt-4">
            <Table>
              <THead><TH>Station</TH><TH>Location</TH><TH align="right">Total swaps</TH><TH align="right">Avg dwell</TH><TH align="right">Completion</TH><TH>Status</TH></THead>
              <TBody>
                {STATION_PERFORMANCE.map((s) => (
                  <TR key={s.name}>
                    <TD className="font-semibold text-ink">{s.name}</TD>
                    <TD>{s.location}</TD>
                    <TD align="right" className="nums font-semibold text-ink">{s.swaps}</TD>
                    <TD align="right" className="nums">{s.dwell}</TD>
                    <TD align="right" className="nums text-success-ink">{s.completion}%</TD>
                    <TD><StatusPill tone={s.status === "online" ? "success" : "warn"}>{s.status === "online" ? "Online" : "Maintenance"}</StatusPill></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-brand-600" /><h3 className="text-[15px] font-semibold text-ink">Insights</h3></div>
          <div className="mt-4 space-y-3">
            {ANALYTICS_INSIGHTS.map((ins, i) => (
              <div key={i} className="rounded-xl border border-line bg-canvas/50 p-3">
                <div className="flex items-start gap-2.5">
                  <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg", ins.kind === "up" ? "bg-success-soft text-success-ink" : "bg-warn-soft text-warn-ink")}>
                    {ins.kind === "up" ? <TrendingUp className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{ins.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted">{ins.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AnalyticKpi({ icon, label, value, delta, up }: { icon: React.ReactNode; label: string; value: string; delta: number; up: boolean }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
        <span className="text-[12px] font-semibold uppercase tracking-wide text-faint">{label}</span>
      </div>
      <p className="nums mt-3 text-[26px] font-bold leading-none text-ink">{value}</p>
      <p className={cn("mt-2 flex items-center gap-1 text-[12px] font-medium", up ? "text-success-ink" : "text-danger-ink")}>
        {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        {up ? "↑" : "↓"} {Math.abs(delta)}% <span className="text-faint">vs previous {30}</span>
      </p>
    </Card>
  );
}

function Sub({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="flex items-center gap-2 text-muted">
      <span className="text-faint">{icon}</span>
      {label} <span className="nums font-semibold text-ink">{value}</span>
    </span>
  );
}

function Lgnd({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</span>;
}
