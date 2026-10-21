"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Download, ExternalLink, Pencil, Building2, CheckCircle2, Radio, Users } from "lucide-react";
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
import { ORGS, ORG_STATS } from "@/lib/mock";
import { exportCsv } from "@/lib/utils";

type Org = (typeof ORGS)[number];

export default function OrganisationsPage() {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All cities");
  const [refreshing, setRefreshing] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORGS.filter((o) => {
      if (q && !`${o.name} ${o.code} ${o.city}`.toLowerCase().includes(q)) return false;
      if (cityFilter !== "All cities" && o.city !== cityFilter) return false;
      return true;
    });
  }, [query, cityFilter]);

  const totalStations = Object.values(ORG_STATS).reduce((a, s) => a + s.stations, 0);
  const totalRiders = Object.values(ORG_STATS).reduce((a, s) => a + s.riders, 0);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Organisations refreshed"); }, 700);
  }
  function handleExport() {
    exportCsv(
      "organisations.csv",
      ["Organisation", "Code", "City", "Stations", "Riders", "Vehicles", "Batteries", "Status", "Created"],
      rows.map((o) => { const s = ORG_STATS[o.id]; return [o.name, o.code, o.city, s.stations, s.riders, s.vehicles, s.batteries, "Active", s.createdAt]; }),
    );
    show("Organisations exported", { description: `${rows.length} ${rows.length === 1 ? "row" : "rows"} · organisations.csv` });
  }

  return (
    <div>
      <PageHeader
        breadcrumb="Admin / Organisations"
        title="Organisations"
        subtitle="Manage fleet organisations and their network details"
        actions={<NewOrgDialog />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Building2 className="h-5 w-5" />} label="Total organisations" value={rows.length} sub="All registered organisations" tone="brand" />
        <KpiCard icon={<CheckCircle2 className="h-5 w-5" />} label="Active organisations" value={rows.length} sub="Currently active" tone="success" />
        <KpiCard icon={<Radio className="h-5 w-5" />} label="Total stations" value={totalStations} sub="Across all organisations" tone="violet" />
        <KpiCard icon={<Users className="h-5 w-5" />} label="Total riders" value={totalRiders} sub="Across all organisations" tone="warn" />
      </div>

      <Toolbar
        placeholder="Search organisations…"
        search={query}
        onSearch={setQuery}
        filters={<FilterSelect label="City" value={cityFilter} onChange={setCityFilter} options={["All cities", "Panchkula", "New Delhi"]} />}
        actions={<><Button variant="secondary" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh</Button><Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4" /> Export</Button></>}
      />

      <Card className="mt-4">
        <Table>
          <THead>
            <TH>Organisation</TH><TH>Code</TH><TH>City</TH><TH align="right">Stations</TH><TH align="right">Riders</TH><TH align="right">Vehicles</TH><TH align="right">Batteries</TH><TH>Status</TH><TH>Created</TH><TH align="right">Actions</TH>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No organisations match your search.</TD><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            ) : rows.map((o) => {
              const s = ORG_STATS[o.id];
              return (
                <TR key={o.id}>
                  <TD>
                    <Link href={`/organisations/${o.id}`} className="text-[14px] font-semibold text-ink hover:text-brand-600">{o.name}</Link>
                    <p className="text-[12px] text-faint">{s.description}</p>
                  </TD>
                  <TD><span className="rounded-md bg-brand-50 px-2 py-0.5 text-[12px] font-semibold text-brand-700">{o.code}</span></TD>
                  <TD>{o.city}</TD>
                  <TD align="right" className="nums font-semibold text-ink">{s.stations}</TD>
                  <TD align="right" className="nums font-semibold text-ink">{s.riders}</TD>
                  <TD align="right" className="nums font-semibold text-ink">{s.vehicles}</TD>
                  <TD align="right" className="nums font-semibold text-ink">{s.batteries}</TD>
                  <TD><StatusPill tone="success">Active</StatusPill></TD>
                  <TD>{s.createdAt}</TD>
                  <TD align="right">
                    <OrgRowActions o={o} show={show} />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {rows.length} of {ORGS.length} organisations</p>
      </Card>
    </div>
  );
}

function OrgRowActions({ o, show }: { o: Org; show: (t: string, opts?: { description?: string; tone?: "success" | "info" | "warn" }) => void }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link href={`/organisations/${o.id}`} className="inline-flex h-8 items-center gap-1 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-canvas">
        Open <ExternalLink className="h-3 w-3" />
      </Link>
      <EditOrgDialog name={o.name} code={o.code} city={o.city} />
      <RowMenu
        items={[
          { label: "Download report", onClick: () => show("Report queued", { description: `${o.name} · organisation report` }) },
          { label: "Archive", onClick: () => show("Organisation archived", { description: o.name, tone: "warn" }) },
          { label: "Delete organisation", danger: true, divider: true, onClick: () => show("Organisation deleted", { description: o.name, tone: "warn" }) },
        ]}
      />
    </div>
  );
}

function NewOrgDialog() {
  return (
    <FormDialog icon={<Building2 className="h-5 w-5" />} trigger={<><Plus className="h-4 w-4" /> New organisation</>} title="New organisation" description="Register a fleet organisation on the network." submitLabel="Create organisation">
      <Field label="Organisation name" placeholder="e.g. EVI Pilot Fleet" required />
      <Field label="Code" placeholder="e.g. EVIPILOT" required />
      <Field label="City" placeholder="e.g. Panchkula" optional />
      <Field label="Description" placeholder="Short description of the organisation" optional />
    </FormDialog>
  );
}

function EditOrgDialog({ name, code, city }: { name: string; code: string; city: string }) {
  return (
    <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<Pencil className="h-3.5 w-3.5" />} triggerVariant="secondary" triggerSize="sm" title={`Edit ${name}`} description="Update organisation details." submitLabel="Save changes">
      <Field label="Organisation name" defaultValue={name} required />
      <Field label="Code" defaultValue={code} required />
      <Field label="City" defaultValue={city} optional />
      <SelectField label="Status" options={["Active", "Inactive"]} required />
    </FormDialog>
  );
}
