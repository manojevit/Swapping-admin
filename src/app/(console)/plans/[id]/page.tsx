"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { ChevronRight, Pencil, Copy, Archive, Trash2, Check, Users, Coins, Tag, CalendarDays, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { PLANS } from "@/lib/mock";
import { formatInr } from "@/lib/utils";

export default function PlanDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { show } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const plan = PLANS.find((p) => p.id === params.id);
  if (!plan) notFound();

  const mrr = plan.price * plan.subscribers;

  return (
    <div>
      <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted">
        <Link href="/overview" className="hover:text-ink">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5 text-faint" />
        <Link href="/plans" className="hover:text-ink">Plans</Link>
        <ChevronRight className="h-3.5 w-3.5 text-faint" />
        <span className="font-medium text-ink">{plan.name}</span>
      </nav>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">{plan.name}</h1>
            <StatusPill tone="success">Active</StatusPill>
          </div>
          <p className="nums mt-1 text-[14px] text-muted"><span className="font-semibold text-ink">{formatInr(plan.price)}</span> · {plan.period} · {plan.orgLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-4 w-4" /> Edit</>} title={`Edit ${plan.name}`} description="Update plan details." submitLabel="Save changes">
            <Field label="Plan name" defaultValue={plan.name} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₹)" type="number" defaultValue={String(plan.price)} required />
              <SelectField label="Period" options={["30 days", "7 days", "Per swap"]} defaultValue={plan.period} required />
            </div>
            <SelectField label="Status" options={["Active", "Inactive"]} required />
          </FormDialog>
          <Button variant="secondary" onClick={() => show("Plan duplicated", { description: `${plan.name} (copy)` })}><Copy className="h-4 w-4" /> Duplicate</Button>
          <Button variant="secondary" onClick={() => show("Plan archived", { description: plan.name, tone: "warn" })}><Archive className="h-4 w-4" /> Archive</Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Tag className="h-5 w-5" />} label="Price" value={formatInr(plan.price)} sub={plan.period} tone="brand" />
        <KpiCard icon={<Users className="h-5 w-5" />} label="Subscribers" value={plan.subscribers} sub="Active on this plan" tone="violet" />
        <KpiCard icon={<Coins className="h-5 w-5" />} label="Est. recurring" value={formatInr(mrr)} sub="From subscribers" tone="success" />
        <KpiCard icon={<Building2 className="h-5 w-5" />} label="Scope" value={plan.shared ? "Shared" : "Single org"} sub={plan.orgLabel} tone="info" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-[15px] font-semibold text-ink">What this plan includes</h3>
          <ul className="mt-4 space-y-2.5">
            {plan.includes.map((i) => (
              <li key={i} className="flex items-center gap-2.5 text-[14px] text-ink"><Check className="h-4 w-4 text-success" />{i}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="text-[15px] font-semibold text-ink">Plan details</h3>
          <div className="mt-4 space-y-3 text-[13px]">
            <Row label="Price" value={formatInr(plan.price)} />
            <Row label="Billing period" value={plan.period} />
            <Row label="Organisation" value={plan.orgLabel} />
            <Row label="Subscribers" value={String(plan.subscribers)} />
            <Row label="Created" value={plan.createdAt} />
          </div>
        </Card>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        icon={<Trash2 className="h-5 w-5" />}
        title={`Delete ${plan.name}?`}
        description="Subscribers on this plan will need to be moved to another plan."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setConfirmDelete(false); show("Plan deleted", { description: plan.name, tone: "warn" }); router.push("/plans"); }}>Delete plan</Button>
          </>
        }
      >
        <p className="text-[13px] text-muted">This cannot be undone. {plan.subscribers} subscriber{plan.subscribers === 1 ? "" : "s"} are currently on this plan.</p>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-2.5 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="nums font-semibold text-ink">{value}</span>
    </div>
  );
}
