"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Download, Check, CheckCheck, TriangleAlert, CircleAlert, Info, FileText, CircleCheck, Radio, BatteryCharging } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { useToast } from "@/components/ui/toast";
import { ALERTS, ALERT_KPIS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { exportCsv, timeAgo } from "@/lib/utils";
import type { AlertSeverity, AlertStatus } from "@/lib/types";

const SEV: Record<AlertSeverity, { tone: "danger" | "warn" | "info"; label: string }> = {
  critical: { tone: "danger", label: "Critical" },
  warning: { tone: "warn", label: "Warning" },
  info: { tone: "info", label: "Info" },
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
  const { show } = useToast();
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const base = user.orgId ? ALERTS.filter((a) => a.orgId === user.orgId) : ALERTS;

  const [query, setQuery] = useState("");
  const [sevFilter, setSevFilter] = useState("All severities");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [orgFilter, setOrgFilter] = useState("All organisations");
  const [refreshing, setRefreshing] = useState(false);
  const [states, setStates] = useState<Record<string, AlertStatus>>({});

  const statusOf = (id: string, fallback: AlertStatus) => states[id] ?? fallback;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((a) => {
      const st = statusOf(a.id, a.status);
      if (q && !`${a.title} ${a.detail} ${a.sourceLabel}`.toLowerCase().includes(q)) return false;
      if (sevFilter !== "All severities" && SEV[a.severity].label !== sevFilter) return false;
      if (statusFilter !== "All status" && ST[st].label !== statusFilter) return false;
      if (orgFilter !== "All organisations" && orgName(a.orgId) !== orgFilter) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, sevFilter, statusFilter, orgFilter, states]);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Alerts refreshed", { description: "Showing the latest events." }); }, 700);
  }

  function handleExport() {
    exportCsv(
      "alerts.csv",
      ["Severity", "Alert", "Detail", "Source", "Organisation", "Raised", "Status"],
      filtered.map((a) => [SEV[a.severity].label, a.title, a.detail, a.sourceLabel, orgName(a.orgId), new Date(a.raisedAt).toISOString(), ST[statusOf(a.id, a.status)].label]),
    );
    show("Alerts exported", { description: `${filtered.length} ${filtered.length === 1 ? "row" : "rows"} · alerts.csv` });
  }

  function acknowledge(id: string, title: string) {
    setStates((s) => ({ ...s, [id]: "acknowledged" }));
    show("Alert acknowledged", { description: title, tone: "info" });
  }
  function resolve(id: string, title: string) {
    setStates((s) => ({ ...s, [id]: "resolved" }));
    show("Alert resolved", { description: title });
  }

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
        search={query}
        onSearch={setQuery}
        filters={
          <>
            <FilterSelect label="Severity" value={sevFilter} onChange={setSevFilter} options={["All severities", "Critical", "Warning", "Info"]} />
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Open", "Acknowledged", "Resolved"]} />
            {can("view_all_orgs") ? <FilterSelect value={orgFilter} onChange={setOrgFilter} options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
          </>
        }
        actions={
          <>
            <Button variant="secondary" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh</Button>
            <Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4" /> Export</Button>
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
            {filtered.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No alerts match your filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            ) : filtered.map((a) => {
              const sev = SEV[a.severity];
              const status = statusOf(a.id, a.status);
              const st = ST[status];
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
                        <Button variant="secondary" size="sm" disabled={status !== "open"} onClick={() => acknowledge(a.id, a.title)}><Check className="h-3.5 w-3.5" /> Acknowledge</Button>
                        <Button variant="primary" size="sm" disabled={status === "resolved"} onClick={() => resolve(a.id, a.title)}><CheckCheck className="h-3.5 w-3.5" /> Resolve</Button>
                      </div>
                    ) : <span className="text-[12px] text-faint">—</span>}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {filtered.length} of {base.length} alerts</p>
      </Card>
    </div>
  );
}
