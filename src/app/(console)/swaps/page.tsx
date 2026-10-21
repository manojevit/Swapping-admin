"use client";

import { Download, RefreshCw, Eye, ArrowRight, CircleCheck, BatteryWarning, CircleX, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { SWAPS, SWAP_KPIS, ORGS, STATIONS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import type { SwapOutcome } from "@/lib/types";

const OUTCOME: Record<SwapOutcome, { tone: "success" | "warn" | "danger" | "info"; label: string }> = {
  completed: { tone: "success", label: "Completed" },
  battery_returned: { tone: "warn", label: "Battery returned" },
  failed: { tone: "danger", label: "Failed" },
  running: { tone: "info", label: "Running" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function SwapsPage() {
  const { user, can } = useSession();
  const rows = user.orgId ? SWAPS.filter((s) => s.orgId === user.orgId) : SWAPS;

  return (
    <div>
      <PageHeader
        breadcrumb="Operations / Swap Report"
        title="Swap Report"
        subtitle="Review battery swap activity, outcomes and station performance"
        actions={<Button variant="secondary" size="lg"><Download className="h-4 w-4" /> Download CSV</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<CircleCheck className="h-5 w-5" />} label="Completed" value={SWAP_KPIS.completed} sub="Successful swaps completed" tone="success" />
        <KpiCard icon={<BatteryWarning className="h-5 w-5" />} label="Battery returned" value={SWAP_KPIS.batteryReturned} sub="Rider left with their own pack" tone="warn" />
        <KpiCard icon={<CircleX className="h-5 w-5" />} label="Failed" value={SWAP_KPIS.failed} sub="Nothing was exchanged" tone="danger" />
        <KpiCard icon={<Clock className="h-5 w-5" />} label="Running now" value={SWAP_KPIS.running} sub="Swaps in progress" tone="info" />
      </div>

      <Toolbar
        placeholder="Search rider, station or battery…"
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="Station" options={["All stations", ...STATIONS.map((s) => s.code)]} />
            <FilterSelect label="Outcome" options={["Every outcome", "Completed", "Battery returned", "Failed"]} />
          </>
        }
        actions={<Button variant="secondary"><RefreshCw className="h-4 w-4" /> Refresh</Button>}
      />

      <Card className="mt-4">
        <Table>
          <THead>
            <TH>When</TH>
            <TH>Station</TH>
            <TH>Rider</TH>
            <TH>Bays</TH>
            <TH>Gave in</TH>
            <TH>Took out</TH>
            <TH>Outcome</TH>
            <TH align="right">Action</TH>
          </THead>
          <TBody>
            {rows.map((s) => {
              const o = OUTCOME[s.outcome];
              return (
                <TR key={s.id}>
                  <TD>
                    <p className="text-[13px] font-semibold text-ink">{fmt(s.startedAt)}</p>
                    <p className="text-[12px] text-faint">ended {fmt(s.endedAt)}</p>
                  </TD>
                  <TD className="nums font-medium text-ink">{s.stationCode}</TD>
                  <TD>
                    <p className="text-ink">{s.riderName}</p>
                    <p className="nums text-[12px] text-faint">{s.riderPhone}</p>
                  </TD>
                  <TD>
                    <span className="nums inline-flex items-center gap-1 text-ink">{s.bayIn} <ArrowRight className="h-3 w-3 text-faint" /> {s.bayOut}</span>
                  </TD>
                  <TD><span className="nums text-ink">{s.gaveInBattery}</span> <span className="nums text-faint">· {s.gaveInSoc}%</span></TD>
                  <TD><span className="nums text-ink">{s.tookOutBattery}</span> <span className="nums text-faint">· {s.tookOutSoc}%</span></TD>
                  <TD>
                    <StatusPill tone={o.tone}>{o.label}</StatusPill>
                    {s.note ? <p className="mt-1 max-w-[200px] text-[12px] text-faint">{s.note}</p> : null}
                  </TD>
                  <TD align="right"><Button variant="secondary" size="sm"><Eye className="h-3.5 w-3.5" /> View</Button></TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing 1 to {rows.length} of {rows.length} swaps</p>
      </Card>
    </div>
  );
}
