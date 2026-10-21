"use client";

import { Plus, RefreshCw, Download, Pencil, Users, UserCheck, UserX, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { RIDERS, RIDER_KPIS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";

export default function RidersPage() {
  const { user, can } = useSession();
  const rows = user.orgId ? RIDERS.filter((r) => r.orgId === user.orgId) : RIDERS;
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";
  const k = user.orgId
    ? {
        total: rows.length,
        active: rows.filter((r) => r.status === "active").length,
        suspended: rows.filter((r) => r.status === "suspended").length,
        swapsToday: rows.reduce((a, r) => a + (r.swaps > 10 ? 2 : 1), 0),
      }
    : RIDER_KPIS;

  return (
    <div>
      <PageHeader
        title="Riders"
        subtitle="Manage and monitor registered riders"
        actions={
          can("manage_riders") ? (
            <FormDialog icon={<Users className="h-5 w-5" />} trigger={<><Plus className="h-4 w-4" /> Add rider</>} title="Add rider" description="Register a new rider on the network." submitLabel="Add rider">
              <Field label="Full name" placeholder="e.g. Rahul Kumar" required />
              <Field label="Phone number" placeholder="+91 ..." required />
              <SelectField label="Organisation" options={ORGS.map((o) => o.name)} />
              <Field label="City" placeholder="e.g. New Delhi" />
              <SelectField label="Swap permission" options={["Allowed", "Blocked"]} />
            </FormDialog>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Users className="h-5 w-5" />} label="Total riders" value={k.total} sub="All registered riders" tone="brand" />
        <KpiCard icon={<UserCheck className="h-5 w-5" />} label="Active riders" value={k.active} sub="Currently active" tone="success" />
        <KpiCard icon={<UserX className="h-5 w-5" />} label="Suspended riders" value={k.suspended} sub="Temporarily suspended" tone="danger" />
        <KpiCard icon={<ArrowLeftRight className="h-5 w-5" />} label="Swaps today" value={k.swapsToday} sub="Completed by riders" tone="warn" />
      </div>

      <Toolbar
        placeholder="Search by rider name, phone number or rider ID…"
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="Status" options={["All status", "Active", "Suspended"]} />
            <FilterSelect label="Swap permission" options={["All permission", "Allowed", "Blocked"]} />
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
            <TH>Rider</TH>
            <TH>Phone</TH>
            <TH>Organisation</TH>
            <TH>City</TH>
            <TH>Vehicle</TH>
            <TH>Battery</TH>
            <TH>Status</TH>
            <TH align="right">Swaps</TH>
            <TH>Swap permission</TH>
            <TH align="right">Action</TH>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD>
                  <p className="text-[14px] font-semibold text-ink">{r.name}</p>
                  <p className="nums text-[12px] text-faint">{r.id}</p>
                </TD>
                <TD className="nums">{r.phone}</TD>
                <TD className="font-medium">{orgName(r.orgId)}</TD>
                <TD>{r.city ?? "—"}</TD>
                <TD>{r.vehicle ? <span className="nums text-ink">{r.vehicle}</span> : <span className="text-faint">Unassigned</span>}</TD>
                <TD>
                  {r.batteryId ? (
                    <span><span className="nums block text-ink">{r.batteryId}</span><span className="nums text-faint">{r.batterySoc}%</span></span>
                  ) : "—"}
                </TD>
                <TD><StatusPill tone={r.status === "active" ? "success" : "danger"}>{r.status === "active" ? "Active" : "Suspended"}</StatusPill></TD>
                <TD align="right" className="nums font-semibold text-ink">{r.swaps}</TD>
                <TD><StatusPill tone={r.swapAllowed ? "success" : "danger"}>{r.swapAllowed ? "Allowed" : "Blocked"}</StatusPill></TD>
                <TD align="right">
                  <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-3.5 w-3.5" /> Edit</>} triggerVariant="secondary" triggerSize="sm" title={`Edit ${r.name}`} description={`Update ${r.id} details.`} submitLabel="Save changes">
                    <Field label="Full name" defaultValue={r.name} />
                    <Field label="Phone number" defaultValue={r.phone} />
                    <Field label="City" defaultValue={r.city ?? ""} />
                    <SelectField label="Status" options={["Active", "Suspended"]} defaultValue={r.status === "active" ? "Active" : "Suspended"} />
                    <SelectField label="Swap permission" options={["Allowed", "Blocked"]} defaultValue={r.swapAllowed ? "Allowed" : "Blocked"} />
                  </FormDialog>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing 1 to {rows.length} of {k.total} riders</p>
      </Card>
    </div>
  );
}
