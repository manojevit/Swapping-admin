"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw, Download, Eye, Pencil, Building2, CheckCircle2, Radio, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { Modal } from "@/components/ui/modal";
import { RowMenu } from "@/components/ui/row-menu";
import { useToast } from "@/components/ui/toast";
import { ORGS, ORG_STATS } from "@/lib/mock";
import { exportCsv } from "@/lib/utils";

type Org = (typeof ORGS)[number];
type OrgStat = (typeof ORG_STATS)[string];

export default function OrganisationsPage() {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All cities");
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<{ o: Org; s: OrgStat } | null>(null);

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
                    <OrgRowActions o={o} s={s} onView={() => setDetail({ o, s })} show={show} />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {rows.length} of {ORGS.length} organisations</p>
      </Card>

      <OrgDetailsModal data={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function OrgRowActions({ o, s, onView, show }: { o: Org; s: OrgStat; onView: () => void; show: (t: string, opts?: { description?: string; tone?: "success" | "info" | "warn" }) => void }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button variant="secondary" size="sm" onClick={onView}><Eye className="h-3.5 w-3.5" /></Button>
      <EditOrgDialog name={o.name} code={o.code} city={o.city} />
      <RowMenu
        items={[
          { label: "View details", onClick: onView },
          { label: "Download report", onClick: () => show("Report queued", { description: `${o.name} · organisation report` }) },
          { label: "Deactivate", onClick: () => show("Organisation deactivated", { description: o.name, tone: "warn" }) },
          { label: "Delete organisation", danger: true, divider: true, onClick: () => show("Organisation deleted", { description: o.name, tone: "warn" }) },
        ]}
      />
    </div>
  );
}

function OrgDetailsModal({ data, onClose }: { data: { o: Org; s: OrgStat } | null; onClose: () => void }) {
  if (!data) return null;
  const { o, s } = data;
  return (
    <Modal open onClose={onClose} icon={<Building2 className="h-5 w-5" />} title={o.name} description={s.description}
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[12px] font-semibold text-brand-700">{o.code}</span>
          <StatusPill tone="success">Active</StatusPill>
          <span className="text-[13px] text-muted">{o.city}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <OrgMetric label="Stations" value={s.stations} />
          <OrgMetric label="Riders" value={s.riders} />
          <OrgMetric label="Vehicles" value={s.vehicles} />
          <OrgMetric label="Batteries" value={s.batteries} />
        </div>
        <div className="space-y-2.5 rounded-xl border border-line p-4 text-[13px]">
          <div className="flex items-center justify-between"><span className="text-muted">Organisation code</span><span className="nums font-semibold text-ink">{o.code}</span></div>
          <div className="flex items-center justify-between"><span className="text-muted">City</span><span className="font-semibold text-ink">{o.city}</span></div>
          <div className="flex items-center justify-between"><span className="text-muted">Created</span><span className="font-semibold text-ink">{s.createdAt}</span></div>
        </div>
      </div>
    </Modal>
  );
}

function OrgMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="text-[11px] font-medium text-faint">{label}</p>
      <p className="nums mt-1 text-[22px] font-bold text-ink">{value}</p>
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
