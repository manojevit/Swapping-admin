"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw, Eye, ArrowRight, CircleCheck, BatteryWarning, CircleX, Clock, ChevronDown, FileText, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { SWAPS, SWAP_KPIS, ORGS, STATIONS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { exportCsv } from "@/lib/utils";
import type { Swap, SwapOutcome } from "@/lib/types";

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
  const { show } = useToast();
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const base = user.orgId ? SWAPS.filter((s) => s.orgId === user.orgId) : SWAPS;

  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("All organisations");
  const [stationFilter, setStationFilter] = useState("All stations");
  const [outcomeFilter, setOutcomeFilter] = useState("Every outcome");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [detail, setDetail] = useState<Swap | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((s) => {
      if (q && !`${s.riderName} ${s.stationCode} ${s.gaveInBattery} ${s.tookOutBattery} ${s.riderPhone}`.toLowerCase().includes(q)) return false;
      if (orgFilter !== "All organisations" && orgName(s.orgId) !== orgFilter) return false;
      if (stationFilter !== "All stations" && s.stationCode !== stationFilter) return false;
      if (outcomeFilter !== "Every outcome" && OUTCOME[s.outcome].label !== outcomeFilter) return false;
      const d = s.startedAt.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, orgFilter, stationFilter, outcomeFilter, from, to]);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Swap report refreshed", { description: "Showing the latest swaps." }); }, 700);
  }

  function downloadCsv() {
    setDownloadOpen(false);
    exportCsv(
      "swap-report.csv",
      ["Started", "Ended", "Station", "Organisation", "Rider", "Phone", "Bay in", "Bay out", "Gave in", "Gave in SOC", "Took out", "Took out SOC", "Outcome", "Note"],
      filtered.map((s) => [new Date(s.startedAt).toISOString(), new Date(s.endedAt).toISOString(), s.stationCode, orgName(s.orgId), s.riderName, s.riderPhone, s.bayIn, s.bayOut, s.gaveInBattery, `${s.gaveInSoc}%`, s.tookOutBattery, `${s.tookOutSoc}%`, OUTCOME[s.outcome].label, s.note ?? ""]),
    );
    show("CSV downloaded", { description: `${filtered.length} ${filtered.length === 1 ? "swap" : "swaps"} · swap-report.csv` });
  }

  async function downloadPdf() {
    setDownloadOpen(false);
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(11, 18, 32);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("EVCHARGEX", 40, 38);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Swap Report", 40, 56);
    doc.setTextColor(170, 180, 198);
    doc.setFontSize(9);
    const scope = user.orgId ? orgName(user.orgId) : "All organisations";
    doc.text(`Generated ${new Date().toLocaleString("en-GB")}  ·  ${scope}  ·  ${filtered.length} swaps`, pageW - 40, 46, { align: "right" });

    autoTable(doc, {
      startY: 86,
      head: [["Started", "Station", "Rider", "Bays", "Gave in", "Took out", "Outcome"]],
      body: filtered.map((s) => [fmt(s.startedAt), s.stationCode, `${s.riderName}\n${s.riderPhone}`, `${s.bayIn} -> ${s.bayOut}`, `${s.gaveInBattery} (${s.gaveInSoc}%)`, `${s.tookOutBattery} (${s.tookOutSoc}%)`, OUTCOME[s.outcome].label]),
      styles: { fontSize: 8, cellPadding: 5, valign: "middle" },
      headStyles: { fillColor: [30, 99, 240], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 249] },
      margin: { left: 40, right: 40 },
      didDrawPage: (data) => {
        const page = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${page}`, pageW - 40, doc.internal.pageSize.getHeight() - 20, { align: "right" });
        doc.text("EVCHARGEX Console", 40, doc.internal.pageSize.getHeight() - 20);
      },
    });

    doc.save("swap-report.pdf");
    show("PDF report downloaded", { description: `${filtered.length} ${filtered.length === 1 ? "swap" : "swaps"} · swap-report.pdf` });
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Operations / Swap Report"
        title="Swap Report"
        subtitle="Review battery swap activity, outcomes and station performance"
        actions={
          <div className="relative">
            <Button variant="primary" size="lg" onClick={() => setDownloadOpen((o) => !o)}>
              <Download className="h-4 w-4" /> Download <ChevronDown className="h-4 w-4" />
            </Button>
            {downloadOpen ? (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDownloadOpen(false)} />
                <div className="absolute right-0 z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-pop">
                  <button onClick={downloadCsv} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink hover:bg-canvas">
                    <FileSpreadsheet className="h-4 w-4 text-success" /> Download CSV
                  </button>
                  <button onClick={downloadPdf} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink hover:bg-canvas">
                    <FileText className="h-4 w-4 text-danger" /> Download PDF report
                  </button>
                </div>
              </>
            ) : null}
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<CircleCheck className="h-5 w-5" />} label="Completed" value={SWAP_KPIS.completed} sub="Successful swaps completed" tone="success" />
        <KpiCard icon={<BatteryWarning className="h-5 w-5" />} label="Battery returned" value={SWAP_KPIS.batteryReturned} sub="Rider left with their own pack" tone="warn" />
        <KpiCard icon={<CircleX className="h-5 w-5" />} label="Failed" value={SWAP_KPIS.failed} sub="Nothing was exchanged" tone="danger" />
        <KpiCard icon={<Clock className="h-5 w-5" />} label="Running now" value={SWAP_KPIS.running} sub="Swaps in progress" tone="info" />
      </div>

      <Toolbar
        placeholder="Search rider, station or battery…"
        search={query}
        onSearch={setQuery}
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" value={orgFilter} onChange={setOrgFilter} options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="Station" value={stationFilter} onChange={setStationFilter} options={["All stations", ...STATIONS.map((s) => s.code)]} />
            <FilterSelect label="Outcome" value={outcomeFilter} onChange={setOutcomeFilter} options={["Every outcome", "Completed", "Battery returned", "Failed"]} />
            <label className="flex items-center gap-1.5 text-[13px] text-muted">From
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-xl border border-line bg-surface px-2.5 text-[13px] text-ink focus:border-brand-300 focus:outline-none" />
            </label>
            <label className="flex items-center gap-1.5 text-[13px] text-muted">To
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-xl border border-line bg-surface px-2.5 text-[13px] text-ink focus:border-brand-300 focus:outline-none" />
            </label>
          </>
        }
        actions={<Button variant="secondary" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh</Button>}
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
            {filtered.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No swaps match your filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            ) : filtered.map((s) => {
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
                  <TD align="right"><Button variant="secondary" size="sm" onClick={() => setDetail(s)}><Eye className="h-3.5 w-3.5" /> View</Button></TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {filtered.length} of {base.length} swaps</p>
      </Card>

      <SwapDetailModal swap={detail} onClose={() => setDetail(null)} orgName={orgName} />
    </div>
  );
}

function SwapDetailModal({ swap, onClose, orgName }: { swap: Swap | null; onClose: () => void; orgName: (id: string) => string }) {
  if (!swap) return null;
  const o = OUTCOME[swap.outcome];
  return (
    <Modal open onClose={onClose} title="Swap details" description={`${swap.stationCode} · ${orgName(swap.orgId)}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusPill tone={o.tone}>{o.label}</StatusPill>
          <span className="nums text-[12px] text-faint">{swap.id}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DetailCell label="Started" value={fmt(swap.startedAt)} />
          <DetailCell label="Ended" value={fmt(swap.endedAt)} />
          <DetailCell label="Rider" value={swap.riderName} sub={swap.riderPhone} />
          <DetailCell label="Bays" value={`${swap.bayIn} → ${swap.bayOut}`} />
          <DetailCell label="Gave in" value={swap.gaveInBattery} sub={`${swap.gaveInSoc}% charge`} />
          <DetailCell label="Took out" value={swap.tookOutBattery} sub={`${swap.tookOutSoc}% charge`} />
        </div>
        {swap.note ? <div className="rounded-xl bg-warn-soft/50 px-4 py-3 text-[13px] text-warn-ink"><span className="font-semibold">Note:</span> {swap.note}</div> : null}
      </div>
    </Modal>
  );
}

function DetailCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="text-[11px] font-medium text-faint">{label}</p>
      <p className="nums mt-0.5 text-[14px] font-semibold text-ink">{value}</p>
      {sub ? <p className="nums text-[12px] text-faint">{sub}</p> : null}
    </div>
  );
}
