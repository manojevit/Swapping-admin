"use client";

import { Upload, Plus, RefreshCw, Download, Pencil, Link2, ExternalLink, Bike, CircleCheck, CircleSlash, UserMinus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { PercentBar } from "@/components/ui/percent-bar";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { VEHICLES, VEHICLE_KPIS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";

export default function VehiclesPage() {
  const { user, can } = useSession();
  const rows = user.orgId ? VEHICLES.filter((v) => v.orgId === user.orgId) : VEHICLES;
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";
  const k = user.orgId
    ? {
        total: rows.length,
        onRoad: rows.filter((v) => v.status === "on_road").length,
        offRoad: rows.filter((v) => v.status === "off_road").length,
        unassigned: rows.filter((v) => !v.rider).length,
      }
    : VEHICLE_KPIS;

  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle="Manage and monitor all registered vehicles in your fleet"
        actions={
          can("manage_vehicles") ? (
            <>
              <Button variant="secondary" size="lg"><Upload className="h-4 w-4" /> Bulk upload</Button>
              <FormDialog trigger={<><Plus className="h-4 w-4" /> Add vehicle</>} title="Add vehicle" description="Register a vehicle to the fleet." submitLabel="Add vehicle">
                <Field label="Vehicle code" placeholder="e.g. EVX-010" required />
                <Field label="Chassis number" placeholder="SESEAG032600..." required />
                <SelectField label="Model" options={["SHEMA LS", "SHEMA", "SHEMA EAGLE"]} />
                <SelectField label="Organisation" options={ORGS.map((o) => o.name)} />
              </FormDialog>
            </>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Bike className="h-5 w-5" />} label="Total vehicles" value={k.total} sub="All registered vehicles" tone="brand" />
        <KpiCard icon={<CircleCheck className="h-5 w-5" />} label="On road" value={k.onRoad} sub="Currently in use" tone="success" />
        <KpiCard icon={<CircleSlash className="h-5 w-5" />} label="Off road" value={k.offRoad} sub="Not in use" tone="neutral" />
        <KpiCard icon={<UserMinus className="h-5 w-5" />} label="Unassigned" value={k.unassigned} sub="No rider assigned" tone="violet" />
      </div>

      <Toolbar
        placeholder="Search by vehicle code, plate number or chassis…"
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="Status" options={["All status", "On road", "Off road"]} />
            <FilterSelect label="Model" options={["All models", "SHEMA LS", "SHEMA", "SHEMA EAGLE"]} />
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
            <TH>Vehicle</TH>
            <TH>Organisation</TH>
            <TH>Model</TH>
            <TH>Rider</TH>
            <TH>Battery</TH>
            <TH>Charge</TH>
            <TH>Status</TH>
            <TH>Location</TH>
            <TH align="right">Swaps</TH>
            <TH align="right">Actions</TH>
          </THead>
          <TBody>
            {rows.map((v) => (
              <TR key={v.id}>
                <TD>
                  <p className="nums text-[14px] font-semibold text-ink">{v.code}</p>
                  <p className="nums text-[12px] text-faint">{v.id}</p>
                </TD>
                <TD className="font-medium">{orgName(v.orgId)}</TD>
                <TD className="font-medium text-ink">{v.model}</TD>
                <TD>
                  {v.rider ? (
                    <span><span className="block text-ink">{v.rider}</span><span className="nums text-faint">{v.riderPhone}</span></span>
                  ) : <span className="text-faint">Unassigned</span>}
                </TD>
                <TD className="nums">{v.batteryId ?? "—"}</TD>
                <TD>{v.charge !== null ? <PercentBar value={v.charge} /> : "—"}</TD>
                <TD><StatusPill tone={v.status === "on_road" ? "success" : "neutral"}>{v.status === "on_road" ? "On road" : "Off road"}</StatusPill></TD>
                <TD>
                  <span className="inline-flex items-center gap-1 text-ink">{v.location}<ExternalLink className="h-3 w-3 text-brand-600" /></span>
                </TD>
                <TD align="right" className="nums font-semibold text-ink">{v.swaps}</TD>
                <TD align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="secondary" size="sm"><Link2 className="h-3.5 w-3.5" /> {v.rider ? "Reassign" : "Assign"}</Button>
                    <Button variant="secondary" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing 1 to {rows.length} of {k.total} vehicles</p>
      </Card>
    </div>
  );
}
