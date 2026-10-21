"use client";

import { RefreshCw, Download, Check, CheckCheck, TriangleAlert, CircleAlert, Info, FileText, CircleCheck, Radio, BatteryCharging } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { ALERTS, ALERT_KPIS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { timeAgo } from "@/lib/utils";
import type { AlertSeverity, AlertStatus } from "@/lib/types";

const SEV: Record<AlertSeverity, { tone: "danger" | "warn" | "info"; label: string; icon: typeof TriangleAlert }> = {
  critical: { tone: "danger", label: "Critical", icon: CircleAlert },
  warning: { tone: "warn", label: "Warning", icon: TriangleAlert },
  info: { tone: "info", label: "Info", icon: Info },
};
const ST: Record<AlertStatus, { tone: "danger" | "info" | "success"; label: string }> = {
  open: { tone: "danger", label: "Open" },
  acknowledged: { tone: "info", label: "Acknowledged" },
  resolved: { tone: "success", label: "Resolved" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function AlertsPage() {
  const { user, can } = useSession();
  const rows = user.orgId ? ALERTS.filter((a) => a.orgId === user.orgId) : ALERTS;
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader breadcrumb="Monitor / Alerts" title="Alerts" subtitle="Monitor network faults and operational events" />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard icon={<CircleAlert className="h-5 w-5" />} label="Critical" value={ALERT_KPIS.critical} sub="Requires immediate attention" tone="danger" />
        <KpiCard icon={<TriangleAlert className="h-5 w-5" />} label="Warning" value={ALERT_KPIS.warning} sub="Needs monitoring" tone="warn" />
        <KpiCard icon={<Info className="h-5 w-5" />} label="Info" value={ALERT_KPIS.info} sub="Informational events" tone="info" />
        <KpiCard icon={<FileText className="h-5 w-5" />} label="Open" value={ALERT_KPIS.open} sub="Awaiting action" tone="brand" />
        <KpiCard icon={<CircleCheck className="h-5 w-5" />} label="Resolved" value={ALERT_KPIS.resolved} sub="Resolved in selected period" tone="success" />
      </div>

      <Toolbar
        placeholder="Search by station, battery, alert…"
        filters={
          <>
            <FilterSelect label="Severity" options={["All severities", "Critical", "Warning", "Info"]} />
            <FilterSelect label="Status" options={["All status", "Open", "Acknowledged", "Resolved"]} />
            {can("view_all_orgs") ? <FilterSelect options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
          </>
        }
        actions={
          <>
            <Button variant="secondary"><RefreshCw className="h-4 w-4" /> Refresh</Button>
            <Button variant="secondary"><Download className="h-4 w-4" /> Export</Button>
          </>
        }
      />

      <Card className="mt-4">
        <Table>
          <THead>
            <TH>Severity</TH>
            <TH>Alert</TH>
            <TH>Source</TH>
            <TH>Organisation</TH>
            <TH>Raised</TH>
            <TH>Status</TH>
            <TH align="right">Actions</TH>
          </THead>
          <TBody>
            {rows.map((a) => {
              const sev = SEV[a.severity];
              const st = ST[a.status];
              const resolved = a.status === "resolved";
              const SourceIcon = a.sourceLabel.startsWith("INC") ? BatteryCharging : Radio;
              return (
                <TR key={a.id}>
                  <TD><StatusPill tone={sev.tone}>{sev.label}</StatusPill></TD>
                  <TD>
                    <p className="text-[14px] font-semibold text-ink">{a.title}</p>
                    <p className="text-[12px] text-muted">{a.detail}</p>
                  </TD>
                  <TD>
                    <span className="nums inline-flex items-center gap-1.5 text-ink"><SourceIcon className="h-3.5 w-3.5 text-faint" />{a.sourceLabel}</span>
                  </TD>
                  <TD className="font-medium">{orgName(a.orgId)}</TD>
                  <TD>
                    <p className="text-[13px] text-ink">{fmt(a.raisedAt)}</p>
                    <p className="text-[12px] text-faint">{timeAgo(a.raisedAt)}</p>
                  </TD>
                  <TD><StatusPill tone={st.tone}>{st.label}</StatusPill></TD>
                  <TD align="right">
                    {can("manage_alerts") ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="secondary" size="sm" disabled={resolved}><Check className="h-3.5 w-3.5" /> Acknowledge</Button>
                        <Button variant="primary" size="sm" disabled={resolved}><CheckCheck className="h-3.5 w-3.5" /> Resolve</Button>
                      </div>
                    ) : <span className="text-[12px] text-faint">—</span>}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing 1 to {rows.length} of {rows.length} alerts</p>
      </Card>
    </div>
  );
}
