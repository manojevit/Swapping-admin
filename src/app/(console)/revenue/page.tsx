"use client";

import { useState } from "react";
import { Wallet, ArrowLeftRight, Users, FileText, RefreshCw, Download, ChevronDown, FileSpreadsheet, IndianRupee } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { REVENUE_KPIS, REVENUE_TREND, REVENUE_BY_PLAN, RECENT_TRANSACTIONS, type TxnStatus } from "@/lib/mock";
import { cn, exportCsv, formatInr, timeAgo } from "@/lib/utils";

const TXN_TONE: Record<TxnStatus, "success" | "warn" | "neutral"> = { paid: "success", pending: "warn", refunded: "neutral" };
const TXN_LABEL: Record<TxnStatus, string> = { paid: "Paid", pending: "Pending", refunded: "Refunded" };

export default function RevenuePage() {
  const { show } = useToast();
  const [range, setRange] = useState("30 days");
  const [refreshing, setRefreshing] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const totalByPlan = REVENUE_BY_PLAN.reduce((a, p) => a + p.amount, 0);

  function pickRange(r: string) {
    if (r === range) return;
    setRange(r);
    show("Date range updated", { description: `Last ${r}`, tone: "info" });
  }
  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Revenue refreshed", { description: "Showing the latest transactions." }); }, 700);
  }
  function exportTxnCsv() {
    setDownloadOpen(false);
    exportCsv(
      "transactions.csv",
      ["Transaction", "Date", "Rider", "Description", "Amount", "Status"],
      RECENT_TRANSACTIONS.map((t) => [t.id, new Date(t.date).toISOString(), t.rider, t.description, t.amount, TXN_LABEL[t.status]]),
    );
    show("CSV downloaded", { description: `${RECENT_TRANSACTIONS.length} transactions · transactions.csv` });
  }
  async function downloadPdf() {
    setDownloadOpen(false);
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(11, 18, 32); doc.rect(0, 0, pageW, 70, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("EVCHARGEX", 40, 38);
    doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.text("Revenue Report", 40, 56);
    doc.setTextColor(170, 180, 198); doc.setFontSize(9);
    doc.text(`Last ${range}  ·  Generated ${new Date().toLocaleString("en-GB")}`, pageW - 40, 46, { align: "right" });

    autoTable(doc, {
      startY: 90,
      head: [["Metric", "Value"]],
      body: [
        ["Revenue", formatInr(REVENUE_KPIS.revenue)],
        ["Paid swaps", String(REVENUE_KPIS.paidSwaps)],
        ["Active subscriptions", String(REVENUE_KPIS.activeSubs)],
        ["Outstanding payments", formatInr(REVENUE_KPIS.outstanding)],
      ],
      styles: { fontSize: 9, cellPadding: 6 }, headStyles: { fillColor: [30, 99, 240], textColor: 255 }, margin: { left: 40, right: 40 },
    });
    const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
    doc.setTextColor(11, 20, 32); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("Recent transactions", 40, y);
    autoTable(doc, {
      startY: y + 10,
      head: [["Date", "Rider", "Description", "Amount", "Status"]],
      body: RECENT_TRANSACTIONS.map((t) => [new Date(t.date).toLocaleDateString("en-GB"), t.rider, t.description, formatInr(t.amount), TXN_LABEL[t.status]]),
      styles: { fontSize: 9, cellPadding: 6 }, headStyles: { fillColor: [30, 99, 240], textColor: 255 }, alternateRowStyles: { fillColor: [245, 247, 249] }, margin: { left: 40, right: 40 },
    });
    doc.save("revenue-report.pdf");
    show("PDF report downloaded", { description: "revenue-report.pdf" });
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Operations / Revenue"
        title="Revenue"
        subtitle="Track revenue from subscriptions and battery swaps"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
              {["30 days", "90 days", "1 year"].map((r) => (
                <button key={r} onClick={() => pickRange(r)} className={cn("rounded-lg px-3 py-1.5 text-[13px] font-semibold", range === r ? "bg-brand-600 text-white" : "text-muted hover:text-ink")}>{r}</button>
              ))}
            </div>
            <div className="relative">
              <Button variant="primary" onClick={() => setDownloadOpen((o) => !o)}><Download className="h-4 w-4" /> Download <ChevronDown className="h-4 w-4" /></Button>
              {downloadOpen ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDownloadOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-pop">
                    <button onClick={downloadPdf} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink hover:bg-canvas"><FileText className="h-4 w-4 text-danger" /> Revenue report (PDF)</button>
                    <button onClick={exportTxnCsv} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink hover:bg-canvas"><FileSpreadsheet className="h-4 w-4 text-success" /> Transactions (CSV)</button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={<Wallet className="h-5 w-5" />} label="Revenue" value={formatInr(REVENUE_KPIS.revenue)} sub={`Last ${range}`} tone="brand" />
        <Kpi icon={<ArrowLeftRight className="h-5 w-5" />} label="Paid swaps" value={String(REVENUE_KPIS.paidSwaps)} sub="Swaps billed" tone="success" />
        <Kpi icon={<Users className="h-5 w-5" />} label="Active subscriptions" value={String(REVENUE_KPIS.activeSubs)} sub="Recurring plans" tone="violet" />
        <Kpi icon={<FileText className="h-5 w-5" />} label="Outstanding payments" value={formatInr(REVENUE_KPIS.outstanding)} sub="Awaiting settlement" tone="warn" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Revenue trend</h3>
            <Button variant="secondary" size="sm" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Refresh</Button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={REVENUE_TREND} margin={{ top: 10, right: 8, left: -6, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E63F0" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#1E63F0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9AA4B2" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#9AA4B2" }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7EBF1", fontSize: 12 }} formatter={(v: number) => [formatInr(v), "Revenue"]} />
              <Area type="monotone" dataKey="amount" stroke="#1E63F0" strokeWidth={2.5} fill="url(#gRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-[15px] font-semibold text-ink">Revenue by plan</h3>
          <div className="mt-4 space-y-3.5">
            {REVENUE_BY_PLAN.map((p) => {
              const pct = Math.round((p.amount / totalByPlan) * 100);
              return (
                <div key={p.plan}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-muted"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.plan}</span>
                    <span className="nums font-semibold text-ink">{formatInr(p.amount)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="text-[15px] font-semibold text-ink">Recent transactions</h3>
          <Button variant="secondary" size="sm" onClick={exportTxnCsv}><Download className="h-3.5 w-3.5" /> Export</Button>
        </div>
        <div className="mt-3">
          <Table>
            <THead><TH>Date</TH><TH>Rider</TH><TH>Description</TH><TH align="right">Amount</TH><TH>Status</TH></THead>
            <TBody>
              {RECENT_TRANSACTIONS.map((t) => (
                <TR key={t.id}>
                  <TD>
                    <p className="text-[13px] text-ink">{timeAgo(t.date)}</p>
                    <p className="nums text-[12px] text-faint">{t.id}</p>
                  </TD>
                  <TD className="font-medium text-ink">{t.rider}</TD>
                  <TD>{t.description}</TD>
                  <TD align="right"><span className="nums inline-flex items-center gap-0.5 font-semibold text-ink"><IndianRupee className="h-3 w-3 text-faint" />{t.amount.toLocaleString("en-IN")}</span></TD>
                  <TD><StatusPill tone={TXN_TONE[t.status]}>{TXN_LABEL[t.status]}</StatusPill></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {RECENT_TRANSACTIONS.length} of {RECENT_TRANSACTIONS.length} transactions</p>
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "brand" | "success" | "violet" | "warn" }) {
  const tones = { brand: "bg-ink/[0.045] text-muted", success: "bg-success-soft text-success-ink", violet: "bg-ink/[0.045] text-muted", warn: "bg-warn-soft text-warn-ink" };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2.5">
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", tones[tone])}>{icon}</span>
        <span className="text-[13px] font-medium text-muted">{label}</span>
      </div>
      <p className="nums mt-3 text-[28px] font-bold leading-none text-ink">{value}</p>
      <p className="mt-2 text-[12px] text-faint">{sub}</p>
    </Card>
  );
}
