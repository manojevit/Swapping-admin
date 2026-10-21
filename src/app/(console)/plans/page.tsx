"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw, Download, Pencil, Upload, Check, FileText, CheckCircle2, Users, Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { RowMenu } from "@/components/ui/row-menu";
import { useToast } from "@/components/ui/toast";
import { PLANS, PLAN_KPIS, ORGS } from "@/lib/mock";
import { exportCsv, formatInr } from "@/lib/utils";

export default function PlansPage() {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("All organisations");
  const [refreshing, setRefreshing] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLANS.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (orgFilter !== "All organisations" && p.orgLabel !== orgFilter) return false;
      return true;
    });
  }, [query, orgFilter]);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Plans refreshed"); }, 700);
  }
  function handleExport() {
    exportCsv(
      "plans.csv",
      ["Plan", "Price", "Period", "Organisation", "Includes", "Subscribers", "Status", "Created"],
      rows.map((p) => [p.name, p.price, p.period, p.orgLabel, p.includes.join(" | "), p.subscribers, "Active", p.createdAt]),
    );
    show("Plans exported", { description: `${rows.length} ${rows.length === 1 ? "row" : "rows"} · plans.csv` });
  }

  return (
    <div>
      <PageHeader
        title="Plans"
        subtitle="Manage subscription plans for your network"
        actions={<NewPlanDialog />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<FileText className="h-5 w-5" />} label="Total plans" value={PLAN_KPIS.total} sub="All subscription plans" tone="brand" />
        <KpiCard icon={<CheckCircle2 className="h-5 w-5" />} label="Active plans" value={PLAN_KPIS.active} sub="Currently active" tone="success" />
        <KpiCard icon={<Users className="h-5 w-5" />} label="Total subscribers" value={PLAN_KPIS.subscribers} sub="Across all plans" tone="violet" />
        <KpiCard icon={<Coins className="h-5 w-5" />} label="Monthly recurring revenue" value={PLAN_KPIS.mrr} sub="From active subscriptions" tone="warn" />
      </div>

      <Toolbar
        placeholder="Search plans by name…"
        search={query}
        onSearch={setQuery}
        filters={<FilterSelect label="Organisation" value={orgFilter} onChange={setOrgFilter} options={["All organisations", "Shared template", ...ORGS.map((o) => o.name)]} />}
        actions={<><Button variant="secondary" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh</Button><Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4" /> Export</Button></>}
      />

      <Card className="mt-4">
        <Table>
          <THead>
            <TH>Plan</TH><TH align="right">Price</TH><TH>Period</TH><TH>Organisation</TH><TH>Includes</TH><TH align="right">Subscribers</TH><TH>Status</TH><TH>Created</TH><TH align="right">Actions</TH>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No plans match your search.</TD><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            ) : rows.map((p) => (
              <TR key={p.id}>
                <TD className="text-[14px] font-semibold text-ink">{p.name}</TD>
                <TD align="right" className="nums font-semibold text-ink">{formatInr(p.price)}</TD>
                <TD>{p.period}</TD>
                <TD>{p.shared ? <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[12px] font-semibold text-brand-700">Shared template</span> : <span className="font-medium">{p.orgLabel}</span>}</TD>
                <TD>
                  <ul className="space-y-1">
                    {p.includes.map((i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[12px] text-muted"><Check className="h-3.5 w-3.5 text-success" />{i}</li>
                    ))}
                  </ul>
                </TD>
                <TD align="right" className="nums font-semibold text-ink">{p.subscribers}</TD>
                <TD><StatusPill tone="success">Active</StatusPill></TD>
                <TD>{p.createdAt}</TD>
                <TD align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => show(p.name, { description: `${formatInr(p.price)} · ${p.period} · ${p.subscribers} subscribers`, tone: "info" })}><Upload className="h-3.5 w-3.5" /> View</Button>
                    <EditPlanDialog name={p.name} price={String(p.price)} period={p.period} />
                    <RowMenu
                      items={[
                        { label: "Duplicate plan", onClick: () => show("Plan duplicated", { description: `${p.name} (copy)` }) },
                        { label: p.status === "active" ? "Deactivate" : "Activate", onClick: () => show(p.status === "active" ? "Plan deactivated" : "Plan activated", { description: p.name, tone: "warn" }) },
                        { label: "Archive plan", danger: true, divider: true, onClick: () => show("Plan archived", { description: p.name, tone: "warn" }) },
                      ]}
                    />
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {rows.length} of {PLANS.length} plans</p>
      </Card>
    </div>
  );
}

function NewPlanDialog() {
  return (
    <FormDialog icon={<FileText className="h-5 w-5" />} trigger={<><Plus className="h-4 w-4" /> New plan</>} title="New plan" description="Create a subscription plan for your network." submitLabel="Create plan">
      <Field label="Plan name" placeholder="e.g. Unlimited Monthly" required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (₹)" type="number" placeholder="2499" required />
        <SelectField label="Period" options={["30 days", "7 days", "Per swap"]} required />
      </div>
      <SelectField label="Organisation" options={["Shared template", "EVI Pilot Fleet", "EVIT ORG"]} required />
      <Field label="What it includes (one per line)" placeholder="Unlimited swaps, every day" optional />
    </FormDialog>
  );
}

function EditPlanDialog({ name, price, period }: { name: string; price: string; period: string }) {
  return (
    <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<Pencil className="h-3.5 w-3.5" />} triggerVariant="secondary" triggerSize="sm" title={`Edit ${name}`} description="Update plan details." submitLabel="Save changes">
      <Field label="Plan name" defaultValue={name} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (₹)" type="number" defaultValue={price} required />
        <SelectField label="Period" options={["30 days", "7 days", "Per swap"]} defaultValue={period} required />
      </div>
      <SelectField label="Status" options={["Active", "Inactive"]} required />
    </FormDialog>
  );
}
