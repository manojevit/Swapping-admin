"use client";

import { Upload, Plus, RefreshCw, Download, ArrowLeftRight, Pencil, BatteryFull, HeartPulse, BatteryLow, TriangleAlert, Car, Radio } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PercentBar } from "@/components/ui/percent-bar";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { BATTERIES, BATTERY_KPIS, ORGS, STATIONS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { timeAgo } from "@/lib/utils";

export default function BatteriesPage() {
  const { user, can } = useSession();
  const rows = user.orgId ? BATTERIES.filter((b) => b.orgId === user.orgId) : BATTERIES;
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";
  const k = user.orgId
    ? {
        total: rows.length,
        healthy: rows.filter((b) => b.health === "healthy").length,
        low: rows.filter((b) => b.health === "low").length,
        fault: rows.filter((b) => b.health === "fault").length,
      }
    : BATTERY_KPIS;

  return (
    <div>
      <PageHeader
        title="Battery Inventory"
        subtitle="Manage and monitor all batteries in your network"
        actions={
          can("manage_batteries") ? (
            <>
              <Button variant="secondary" size="lg"><Upload className="h-4 w-4" /> Bulk upload</Button>
              <FormDialog icon={<BatteryFull className="h-5 w-5" />} trigger={<><Plus className="h-4 w-4" /> Register battery</>} title="Register battery" description="Add a new battery pack to inventory." submitLabel="Register battery">
                <Field label="Serial number" placeholder="INCBZG5145M...." required />
                <Field label="Brand" placeholder="e.g. Superpower" optional />
                <SelectField label="Organisation" options={ORGS.map((o) => o.name)} required />
                <SelectField label="Assign to station" options={["Unassigned", ...STATIONS.map((s) => s.code)]} optional />
              </FormDialog>
            </>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<BatteryFull className="h-5 w-5" />} label="Total batteries" value={k.total} sub="All registered batteries" tone="brand" />
        <KpiCard icon={<HeartPulse className="h-5 w-5" />} label="Healthy" value={k.healthy} sub="Batteries in good condition" tone="success" />
        <KpiCard icon={<BatteryLow className="h-5 w-5" />} label="Low charge" value={k.low} sub="Below 20% charge" tone="warn" />
        <KpiCard icon={<TriangleAlert className="h-5 w-5" />} label="Fault / Service required" value={k.fault} sub="Need attention" tone="danger" />
      </div>

      <Toolbar
        placeholder="Search by serial number or brand…"
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="In station" options={["All stations", ...STATIONS.map((s) => s.code)]} />
          </>
        }
        actions={
          <>
            <Button variant="secondary"><RefreshCw className="h-4 w-4" /> Refresh</Button>
            <Button variant="secondary"><Download className="h-4 w-4" /> Export</Button>
          </>
        }
      />

      <Card className="mt-4">
        <Table>
          <THead>
            <TH>Serial</TH>
            <TH>Brand</TH>
            <TH>Organisation</TH>
            <TH>Where it is</TH>
            <TH>SOC</TH>
            <TH>SOH</TH>
            <TH>Updated</TH>
            <TH align="right">Actions</TH>
          </THead>
          <TBody>
            {rows.map((b) => (
              <TR key={b.id}>
                <TD className="nums font-semibold text-ink">{b.id}</TD>
                <TD className="font-medium">{b.brand}</TD>
                <TD>{orgName(b.orgId)}</TD>
                <TD>
                  <span className="inline-flex items-center gap-1.5">
                    {b.whereKind === "vehicle" ? <Car className="h-3.5 w-3.5 text-faint" /> : <Radio className="h-3.5 w-3.5 text-faint" />}
                    {b.whereLabel}
                  </span>
                </TD>
                <TD><PercentBar value={b.soc} /></TD>
                <TD><PercentBar value={b.soh} /></TD>
                <TD>{timeAgo(b.updatedAt)}</TD>
                <TD align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="secondary" size="sm"><ArrowLeftRight className="h-3.5 w-3.5" /> Move</Button>
                    <Button variant="secondary" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing 1 to {rows.length} of {k.total} batteries</p>
      </Card>
    </div>
  );
}
