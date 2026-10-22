"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Download, Check, CheckCheck, TriangleAlert, CircleAlert, Info, FileText, CircleCheck, Radio, BatteryCharging, LifeBuoy, MessageSquare, Send, User, ExternalLink, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ALERTS, ALERT_KPIS, ORGS, STATIONS, TICKETS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { exportCsv, timeAgo } from "@/lib/utils";
import type { Alert, AlertSeverity, AlertStatus, Ticket, TicketStatus } from "@/lib/types";

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
const TST: Record<TicketStatus, { tone: "danger" | "warn" | "success"; label: string }> = {
  open: { tone: "danger", label: "Open" },
  in_progress: { tone: "warn", label: "In progress" },
  resolved: { tone: "success", label: "Resolved" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function AlertsPage() {
  const { user, can } = useSession();
  const { show } = useToast();
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const [tab, setTab] = useState<"alerts" | "tickets">("alerts");

  // ---------- Alerts ----------
  const base = user.orgId ? ALERTS.filter((a) => a.orgId === user.orgId) : ALERTS;
  const [query, setQuery] = useState("");
  const [sevFilter, setSevFilter] = useState("All severities");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [orgFilter, setOrgFilter] = useState("All organisations");
  const [refreshing, setRefreshing] = useState(false);
  const [states, setStates] = useState<Record<string, AlertStatus>>({});
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const statusOf = (id: string, fallback: AlertStatus) => states[id] ?? fallback;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((a) => {
      if (q && !`${a.title} ${a.detail} ${a.sourceLabel}`.toLowerCase().includes(q)) return false;
      if (sevFilter !== "All severities" && SEV[a.severity].label !== sevFilter) return false;
      if (statusFilter !== "All status" && ST[statusOf(a.id, a.status)].label !== statusFilter) return false;
      if (orgFilter !== "All organisations" && orgName(a.orgId) !== orgFilter) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, sevFilter, statusFilter, orgFilter, states]);

  function acknowledge(id: string, title: string) { setStates((s) => ({ ...s, [id]: "acknowledged" })); show("Alert acknowledged", { description: title, tone: "info" }); }
  function resolve(id: string, title: string) { setStates((s) => ({ ...s, [id]: "resolved" })); show("Alert resolved", { description: title }); }

  function refreshAlerts() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Alerts refreshed"); }, 700);
  }
  function exportAlerts() {
    exportCsv("alerts.csv", ["Severity", "Alert", "Detail", "Source", "Organisation", "Raised", "Status"],
      filtered.map((a) => [SEV[a.severity].label, a.title, a.detail, a.sourceLabel, orgName(a.orgId), new Date(a.raisedAt).toISOString(), ST[statusOf(a.id, a.status)].label]));
    show("Alerts exported", { description: `${filtered.length} rows · alerts.csv` });
  }
  const sourceStation = (label: string) => STATIONS.find((s) => s.code === label) ?? null;

  // ---------- Tickets ----------
  const tbase = user.orgId ? TICKETS.filter((t) => t.orgId === user.orgId) : TICKETS;
  const [tquery, setTquery] = useState("");
  const [tcat, setTcat] = useState("All categories");
  const [tstat, setTstat] = useState("All status");
  const [ticketStates, setTicketStates] = useState<Record<string, TicketStatus>>({});
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const tStatusOf = (id: string, fallback: TicketStatus) => ticketStates[id] ?? fallback;
  const categories = Array.from(new Set(TICKETS.map((t) => t.category)));

  const tfiltered = useMemo(() => {
    const q = tquery.trim().toLowerCase();
    return tbase.filter((t) => {
      if (q && !`${t.id} ${t.subject} ${t.rider} ${t.category}`.toLowerCase().includes(q)) return false;
      if (tcat !== "All categories" && t.category !== tcat) return false;
      if (tstat !== "All status" && TST[tStatusOf(t.id, t.status)].label !== tstat) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tbase, tquery, tcat, tstat, ticketStates]);

  const tOpen = tbase.filter((t) => tStatusOf(t.id, t.status) === "open").length;
  const tProg = tbase.filter((t) => tStatusOf(t.id, t.status) === "in_progress").length;
  const tDone = tbase.filter((t) => tStatusOf(t.id, t.status) === "resolved").length;

  function setTicket(id: string, s: TicketStatus, subject: string) {
    setTicketStates((m) => ({ ...m, [id]: s }));
    show(s === "resolved" ? "Ticket resolved" : s === "in_progress" ? "Ticket in progress" : "Ticket reopened", { description: subject, tone: s === "resolved" ? "success" : "info" });
  }
  function exportTickets() {
    exportCsv("tickets.csv", ["Ticket", "Rider", "Phone", "Subject", "Category", "Raised", "Status"],
      tfiltered.map((t) => [t.id, t.rider, t.phone, t.subject, t.category, new Date(t.raisedAt).toISOString(), TST[tStatusOf(t.id, t.status)].label]));
    show("Tickets exported", { description: `${tfiltered.length} rows · tickets.csv` });
  }

  const alertOpenCount = base.filter((a) => statusOf(a.id, a.status) !== "resolved").length;

  return (
    <div>
      <PageHeader breadcrumb="Monitor / Alerts" title="Alerts & tickets" subtitle="Network faults, and support tickets raised by riders in the app" />

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-1 border-b border-line">
        <TabBtn active={tab === "alerts"} onClick={() => setTab("alerts")}>Alerts <Count n={alertOpenCount} active={tab === "alerts"} /></TabBtn>
        <TabBtn active={tab === "tickets"} onClick={() => setTab("tickets")}>Tickets <Count n={tOpen} active={tab === "tickets"} /></TabBtn>
      </div>

      {tab === "alerts" ? (
        <>
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
                <Button variant="secondary" onClick={refreshAlerts} disabled={refreshing}><RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh</Button>
                <Button variant="secondary" onClick={exportAlerts}><Download className="h-4 w-4" /> Export</Button>
              </>
            }
          />

          <Card className="mt-4">
            <Table>
              <THead>
                <TH>Severity</TH><TH>Alert</TH><TH>Source</TH><TH>Organisation</TH><TH>Raised</TH><TH>Status</TH><TH align="right">Actions</TH>
              </THead>
              <TBody>
                {filtered.length === 0 ? (
                  <TR><TD className="py-10 text-center text-muted">No alerts match your filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /></TR>
                ) : filtered.map((a) => {
                  const status = statusOf(a.id, a.status);
                  const SourceIcon = a.sourceLabel.startsWith("INC") ? BatteryCharging : Radio;
                  return (
                    <TR key={a.id}>
                      <TD><StatusPill tone={SEV[a.severity].tone}>{SEV[a.severity].label}</StatusPill></TD>
                      <TD>
                        <button onClick={() => setSelectedAlert(a)} className="text-left">
                          <span className="block text-[14px] font-semibold text-ink hover:text-brand-600">{a.title}</span>
                          <span className="block text-[12px] text-muted">{a.detail}</span>
                        </button>
                      </TD>
                      <TD><span className="nums inline-flex items-center gap-1.5 text-ink"><SourceIcon className="h-3.5 w-3.5 text-faint" />{a.sourceLabel}</span></TD>
                      <TD className="font-medium">{orgName(a.orgId)}</TD>
                      <TD><p className="text-[13px] text-ink">{fmt(a.raisedAt)}</p><p className="text-[12px] text-faint">{timeAgo(a.raisedAt)}</p></TD>
                      <TD><StatusPill tone={ST[status].tone}>{ST[status].label}</StatusPill></TD>
                      <TD align="right">
                        {can("manage_alerts") ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="secondary" size="sm" disabled={status !== "open"} onClick={() => acknowledge(a.id, a.title)}><Check className="h-3.5 w-3.5" /> Ack</Button>
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
        </>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard icon={<LifeBuoy className="h-5 w-5" />} label="Total tickets" value={tbase.length} sub="From the rider app" tone="brand" />
            <KpiCard icon={<CircleAlert className="h-5 w-5" />} label="Open" value={tOpen} sub="Awaiting a response" tone="danger" />
            <KpiCard icon={<Clock className="h-5 w-5" />} label="In progress" value={tProg} sub="Being worked on" tone="warn" />
            <KpiCard icon={<CircleCheck className="h-5 w-5" />} label="Resolved" value={tDone} sub="Closed out" tone="success" />
          </div>

          <Toolbar
            placeholder="Search by ticket, rider or subject…"
            search={tquery}
            onSearch={setTquery}
            filters={
              <>
                <FilterSelect label="Category" value={tcat} onChange={setTcat} options={["All categories", ...categories]} />
                <FilterSelect label="Status" value={tstat} onChange={setTstat} options={["All status", "Open", "In progress", "Resolved"]} />
              </>
            }
            actions={<Button variant="secondary" onClick={exportTickets}><Download className="h-4 w-4" /> Export</Button>}
          />

          <Card className="mt-4">
            <Table>
              <THead>
                <TH>Ticket</TH><TH>Rider</TH><TH>Category</TH><TH>Raised</TH><TH>Status</TH><TH align="right">Action</TH>
              </THead>
              <TBody>
                {tfiltered.length === 0 ? (
                  <TR><TD className="py-10 text-center text-muted">No tickets match your filters.</TD><TD /><TD /><TD /><TD /><TD /></TR>
                ) : tfiltered.map((t) => {
                  const status = tStatusOf(t.id, t.status);
                  return (
                    <TR key={t.id}>
                      <TD>
                        <button onClick={() => setSelectedTicket(t)} className="text-left">
                          <span className="block max-w-[280px] truncate text-[14px] font-semibold text-ink hover:text-brand-600">{t.subject}</span>
                          <span className="nums block text-[12px] text-faint">{t.id}</span>
                        </button>
                      </TD>
                      <TD><p className="text-ink">{t.rider}</p><p className="nums text-[12px] text-faint">{t.phone}</p></TD>
                      <TD><span className="rounded-md bg-black/5 px-2 py-0.5 text-[12px] font-medium text-muted">{t.category}</span></TD>
                      <TD><p className="text-[13px] text-ink">{timeAgo(t.raisedAt)}</p></TD>
                      <TD><StatusPill tone={TST[status].tone}>{TST[status].label}</StatusPill></TD>
                      <TD align="right"><Button variant="secondary" size="sm" onClick={() => setSelectedTicket(t)}><MessageSquare className="h-3.5 w-3.5" /> Open</Button></TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            <p className="px-5 py-3 text-[12px] text-faint">Showing {tfiltered.length} of {tbase.length} tickets</p>
          </Card>
        </>
      )}

      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        status={selectedAlert ? statusOf(selectedAlert.id, selectedAlert.status) : "open"}
        orgName={orgName}
        sourceStation={selectedAlert ? sourceStation(selectedAlert.sourceLabel) : null}
        canManage={can("manage_alerts")}
        onAck={(a) => acknowledge(a.id, a.title)}
        onResolve={(a) => resolve(a.id, a.title)}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        status={selectedTicket ? tStatusOf(selectedTicket.id, selectedTicket.status) : "open"}
        canManage={can("manage_alerts")}
        onSetStatus={(t, s) => setTicket(t.id, s, t.subject)}
        onReply={(t) => show("Reply sent to rider", { description: `${t.rider} · ${t.id}` })}
      />
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-[14px] font-semibold transition-colors ${active ? "border-brand-600 text-brand-600" : "border-transparent text-muted hover:text-ink"}`}>
      {children}
    </button>
  );
}
function Count({ n, active }: { n: number; active: boolean }) {
  return <span className={`nums rounded-full px-1.5 text-[11px] ${active ? "bg-brand-50 text-brand-700" : "bg-black/5 text-faint"}`}>{n}</span>;
}

function AlertDetailModal({ alert, onClose, status, orgName, sourceStation, canManage, onAck, onResolve }: {
  alert: Alert | null; onClose: () => void; status: AlertStatus; orgName: (id: string) => string;
  sourceStation: { id: string; code: string } | null; canManage: boolean; onAck: (a: Alert) => void; onResolve: (a: Alert) => void;
}) {
  if (!alert) return null;
  const isBattery = alert.sourceLabel.startsWith("INC");
  return (
    <Modal open onClose={onClose} icon={<TriangleAlert className="h-5 w-5" />} title={alert.title} description={alert.detail}
      footer={
        canManage ? (
          <>
            <Button variant="secondary" disabled={status !== "open"} onClick={() => onAck(alert)}><Check className="h-4 w-4" /> Acknowledge</Button>
            <Button variant="primary" disabled={status === "resolved"} onClick={() => onResolve(alert)}><CheckCheck className="h-4 w-4" /> Resolve</Button>
          </>
        ) : <Button variant="secondary" onClick={onClose}>Close</Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={SEV[alert.severity].tone}>{SEV[alert.severity].label}</StatusPill>
          <StatusPill tone={ST[status].tone}>{ST[status].label}</StatusPill>
          <span className="text-[12px] text-faint">Raised {fmt(alert.raisedAt)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <Field label="Source" value={alert.sourceLabel} />
          <Field label="Organisation" value={orgName(alert.orgId)} />
        </div>
        <div className="rounded-xl border border-line bg-canvas/50 p-4">
          <p className="text-[12px] font-medium text-faint">Where to act</p>
          {sourceStation ? (
            <Link href={`/stations/${sourceStation.id}`} className="mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:text-brand-700">
              Open {sourceStation.code} <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : isBattery ? (
            <Link href="/batteries" className="mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:text-brand-700">
              Find {alert.sourceLabel} in Batteries <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <p className="mt-1 text-[13px] text-muted">{alert.sourceLabel}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function TicketDetailModal({ ticket, onClose, status, canManage, onSetStatus, onReply }: {
  ticket: Ticket | null; onClose: () => void; status: TicketStatus; canManage: boolean;
  onSetStatus: (t: Ticket, s: TicketStatus) => void; onReply: (t: Ticket) => void;
}) {
  if (!ticket) return null;
  return (
    <Modal open onClose={onClose} icon={<LifeBuoy className="h-5 w-5" />} title={ticket.subject} description={`${ticket.id} · ${ticket.category}`}
      footer={
        canManage ? (
          <>
            {status !== "in_progress" && status !== "resolved" ? <Button variant="secondary" onClick={() => onSetStatus(ticket, "in_progress")}>Start progress</Button> : null}
            <Button variant="primary" disabled={status === "resolved"} onClick={() => onSetStatus(ticket, "resolved")}><CheckCheck className="h-4 w-4" /> Mark resolved</Button>
          </>
        ) : <Button variant="secondary" onClick={onClose}>Close</Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={TST[status].tone}>{TST[status].label}</StatusPill>
          <span className="text-[12px] text-faint">Raised {fmt(ticket.raisedAt)}</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-line p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-[13px] font-bold text-white">{ticket.rider.charAt(0)}</span>
          <div className="leading-tight"><p className="text-[13px] font-semibold text-ink"><User className="mr-1 inline h-3.5 w-3.5 text-faint" />{ticket.rider}</p><p className="nums text-[12px] text-faint">{ticket.phone}</p></div>
        </div>
        <div className="rounded-xl bg-canvas/60 p-4">
          <p className="mb-1 text-[12px] font-medium text-faint">Message from rider</p>
          <p className="text-[14px] leading-relaxed text-ink">{ticket.message}</p>
        </div>
        {canManage ? (
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink">Reply</p>
            <textarea rows={3} placeholder="Type a reply to the rider…" className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-faint focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
            <div className="mt-2 flex justify-end">
              <Button variant="secondary" onClick={() => onReply(ticket)}><Send className="h-4 w-4" /> Send reply</Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="text-[11px] font-medium text-faint">{label}</p>
      <p className="nums mt-0.5 text-[14px] font-semibold text-ink">{value}</p>
    </div>
  );
}
