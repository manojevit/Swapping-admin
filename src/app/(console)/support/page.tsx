"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw, CircleAlert, Clock, CircleCheck, LifeBuoy, MessageSquare, Send, User, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { TICKETS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { exportCsv, timeAgo } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/lib/types";

const TST: Record<TicketStatus, { tone: "danger" | "warn" | "success"; label: string }> = {
  open: { tone: "danger", label: "Open" },
  in_progress: { tone: "warn", label: "In progress" },
  resolved: { tone: "success", label: "Resolved" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function SupportPage() {
  const { user, can } = useSession();
  const { show } = useToast();

  const base = user.orgId ? TICKETS.filter((t) => t.orgId === user.orgId) : TICKETS;
  const categories = Array.from(new Set(TICKETS.map((t) => t.category)));

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All categories");
  const [stat, setStat] = useState("All status");
  const [refreshing, setRefreshing] = useState(false);
  const [ticketStates, setTicketStates] = useState<Record<string, TicketStatus>>({});
  const [selected, setSelected] = useState<Ticket | null>(null);
  const statusOf = (id: string, fallback: TicketStatus) => ticketStates[id] ?? fallback;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((t) => {
      if (q && !`${t.id} ${t.subject} ${t.rider} ${t.category}`.toLowerCase().includes(q)) return false;
      if (cat !== "All categories" && t.category !== cat) return false;
      if (stat !== "All status" && TST[statusOf(t.id, t.status)].label !== stat) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, cat, stat, ticketStates]);

  const open = base.filter((t) => statusOf(t.id, t.status) === "open").length;
  const prog = base.filter((t) => statusOf(t.id, t.status) === "in_progress").length;
  const done = base.filter((t) => statusOf(t.id, t.status) === "resolved").length;

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Support tickets refreshed"); }, 700);
  }
  function handleExport() {
    exportCsv("tickets.csv", ["Ticket", "Rider", "Phone", "Subject", "Category", "Raised", "Status"],
      filtered.map((t) => [t.id, t.rider, t.phone, t.subject, t.category, new Date(t.raisedAt).toISOString(), TST[statusOf(t.id, t.status)].label]));
    show("Tickets exported", { description: `${filtered.length} ${filtered.length === 1 ? "row" : "rows"} · tickets.csv` });
  }
  function setStatus(t: Ticket, s: TicketStatus) {
    setTicketStates((m) => ({ ...m, [t.id]: s }));
    show(s === "resolved" ? "Ticket resolved" : s === "in_progress" ? "Ticket in progress" : "Ticket reopened", { description: t.subject, tone: s === "resolved" ? "success" : "info" });
  }

  return (
    <div>
      <PageHeader breadcrumb="Operations / Support" title="Support tickets" subtitle="Help requests raised by riders in the EVCHARGEX app" />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<LifeBuoy className="h-5 w-5" />} label="Total tickets" value={base.length} sub="From the rider app" tone="brand" />
        <KpiCard icon={<CircleAlert className="h-5 w-5" />} label="Open" value={open} sub="Awaiting a response" tone="danger" />
        <KpiCard icon={<Clock className="h-5 w-5" />} label="In progress" value={prog} sub="Being worked on" tone="warn" />
        <KpiCard icon={<CircleCheck className="h-5 w-5" />} label="Resolved" value={done} sub="Closed out" tone="success" />
      </div>

      <Toolbar
        placeholder="Search by ticket, rider or subject…"
        search={query}
        onSearch={setQuery}
        filters={
          <>
            <FilterSelect label="Category" value={cat} onChange={setCat} options={["All categories", ...categories]} />
            <FilterSelect label="Status" value={stat} onChange={setStat} options={["All status", "Open", "In progress", "Resolved"]} />
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
            <TH>Ticket</TH><TH>Rider</TH><TH>Category</TH><TH>Raised</TH><TH>Status</TH><TH align="right">Action</TH>
          </THead>
          <TBody>
            {filtered.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No tickets match your filters.</TD><TD /><TD /><TD /><TD /><TD /></TR>
            ) : filtered.map((t) => {
              const status = statusOf(t.id, t.status);
              return (
                <TR key={t.id}>
                  <TD>
                    <button onClick={() => setSelected(t)} className="text-left">
                      <span className="block max-w-[320px] truncate text-[14px] font-semibold text-ink hover:text-brand-600">{t.subject}</span>
                      <span className="nums block text-[12px] text-faint">{t.id}</span>
                    </button>
                  </TD>
                  <TD><p className="text-ink">{t.rider}</p><p className="nums text-[12px] text-faint">{t.phone}</p></TD>
                  <TD><span className="rounded-md bg-black/5 px-2 py-0.5 text-[12px] font-medium text-muted">{t.category}</span></TD>
                  <TD><p className="text-[13px] text-ink">{timeAgo(t.raisedAt)}</p></TD>
                  <TD><StatusPill tone={TST[status].tone}>{TST[status].label}</StatusPill></TD>
                  <TD align="right"><Button variant="secondary" size="sm" onClick={() => setSelected(t)}><MessageSquare className="h-3.5 w-3.5" /> Open</Button></TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {filtered.length} of {base.length} tickets</p>
      </Card>

      <TicketDetailModal
        ticket={selected}
        onClose={() => setSelected(null)}
        status={selected ? statusOf(selected.id, selected.status) : "open"}
        canManage={can("manage_alerts")}
        onSetStatus={setStatus}
        onReply={(t) => show("Reply sent to rider", { description: `${t.rider} · ${t.id}` })}
      />
    </div>
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
            {status === "open" ? <Button variant="secondary" onClick={() => onSetStatus(ticket, "in_progress")}>Start progress</Button> : null}
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
          <div className="leading-tight"><p className="flex items-center gap-1 text-[13px] font-semibold text-ink"><User className="h-3.5 w-3.5 text-faint" />{ticket.rider}</p><p className="nums text-[12px] text-faint">{ticket.phone}</p></div>
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
