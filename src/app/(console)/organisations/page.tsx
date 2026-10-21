"use client";

import { Plus, RefreshCw, Download, Eye, Pencil, MoreVertical, Building2, CheckCircle2, Radio, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { ORGS, ORG_STATS } from "@/lib/mock";

export default function OrganisationsPage() {
  const rows = ORGS;
  const totalStations = Object.values(ORG_STATS).reduce((a, s) => a + s.stations, 0);
  const totalRiders = Object.values(ORG_STATS).reduce((a, s) => a + s.riders, 0);

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
        filters={<><FilterSelect label="Status" options={["All status", "Active", "Inactive"]} /><FilterSelect label="City" options={["All cities", "Panchkula", "New Delhi"]} /></>}
        actions={<><Button variant="secondary"><RefreshCw className="h-4 w-4" /> Refresh</Button><Button variant="secondary"><Download className="h-4 w-4" /> Export</Button></>}
      />

      <Card className="mt-4">
        <Table>
          <THead>
            <TH>Organisation</TH><TH>Code</TH><TH>City</TH><TH align="right">Stations</TH><TH align="right">Riders</TH><TH align="right">Vehicles</TH><TH align="right">Batteries</TH><TH>Status</TH><TH>Created</TH><TH align="right">Actions</TH>
          </THead>
          <TBody>
            {rows.map((o) => {
              const s = ORG_STATS[o.id];
              return (
                <TR key={o.id}>
                  <TD>
                    <p className="text-[14px] font-semibold text-ink">{o.name}</p>
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="secondary" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                      <EditOrgDialog name={o.name} code={o.code} city={o.city} />
                      <Button variant="secondary" size="sm"><MoreVertical className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing 1 to {rows.length} of {rows.length} organisations</p>
      </Card>
    </div>
  );
}

function NewOrgDialog() {
  return (
    <FormDialog trigger={<><Plus className="h-4 w-4" /> New organisation</>} title="New organisation" description="Register a fleet organisation on the network." submitLabel="Create organisation">
      <Field label="Organisation name" placeholder="e.g. EVI Pilot Fleet" required />
      <Field label="Code" placeholder="e.g. EVIPILOT" required />
      <Field label="City" placeholder="e.g. Panchkula" />
      <Field label="Description" placeholder="Short description of the organisation" />
    </FormDialog>
  );
}

function EditOrgDialog({ name, code, city }: { name: string; code: string; city: string }) {
  return (
    <FormDialog trigger={<Pencil className="h-3.5 w-3.5" />} triggerVariant="secondary" triggerSize="sm" title={`Edit ${name}`} submitLabel="Save changes">
      <Field label="Organisation name" defaultValue={name} />
      <Field label="Code" defaultValue={code} />
      <Field label="City" defaultValue={city} />
      <SelectField label="Status" options={["Active", "Inactive"]} />
    </FormDialog>
  );
}
