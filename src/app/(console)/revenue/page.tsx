"use client";

import { useState } from "react";
import { Wallet, ArrowLeftRight, Users, FileText, RefreshCw, Download, BarChart3, PieChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// No revenue is recorded in the pilot yet, so this screen is the empty state
// from the approved design. When the API returns transactions, the same
// components render the trend chart, plan split and transactions table.
export default function RevenuePage() {
  const [range, setRange] = useState("30 days");

  return (
    <div>
      <PageHeader
        breadcrumb="Operations / Revenue"
        title="Revenue"
        subtitle="Track revenue from subscriptions and battery swaps"
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
            {["30 days", "90 days", "1 year"].map((r) => (
              <button key={r} onClick={() => setRange(r)} className={cn("rounded-lg px-3 py-1.5 text-[13px] font-semibold", range === r ? "bg-brand-600 text-white" : "text-muted hover:text-ink")}>{r}</button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={<Wallet className="h-5 w-5" />} label="Revenue" value="₹0" sub="No revenue recorded yet" tone="brand" />
        <Kpi icon={<ArrowLeftRight className="h-5 w-5" />} label="Paid swaps" value="0" sub="No paid swaps yet" tone="success" />
        <Kpi icon={<Users className="h-5 w-5" />} label="Active subscriptions" value="0" sub="No active subscriptions" tone="violet" />
        <Kpi icon={<FileText className="h-5 w-5" />} label="Outstanding payments" value="₹0" sub="No pending payments" tone="warn" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Revenue trend</h3>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
              <Button variant="secondary" size="sm" disabled><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          </div>
          <EmptyChart icon={<BarChart3 className="h-6 w-6" />} title="No revenue recorded yet" body="Revenue trends will appear once riders start swapping and paying." />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Revenue by plan</h3>
            <Button variant="secondary" size="sm" disabled><Download className="h-3.5 w-3.5" /> Export</Button>
          </div>
          <EmptyChart icon={<PieChart className="h-6 w-6" />} title="No revenue recorded yet" body="Plan-wise revenue will appear once subscriptions are active." />
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Recent transactions</h3>
          <Button variant="secondary" size="sm" disabled><Download className="h-3.5 w-3.5" /> Export</Button>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-canvas/40 px-4 py-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><FileText className="h-5 w-5" /></span>
          <div>
            <p className="text-[14px] font-semibold text-ink">No transactions yet</p>
            <p className="text-[13px] text-muted">Transactions will appear here once riders start swapping and paying.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "brand" | "success" | "violet" | "warn" }) {
  const tones = { brand: "bg-brand-50 text-brand-600", success: "bg-success-soft text-success-ink", violet: "bg-violet-100 text-violet-600", warn: "bg-warn-soft text-warn-ink" };
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

function EmptyChart({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="mt-4 grid place-items-center rounded-xl border border-dashed border-line py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
      <p className="mt-3 text-[14px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] text-muted">{body}</p>
    </div>
  );
}
