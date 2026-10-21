"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw, Download, Pencil, Users, UserCheck, UserX, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { useToast } from "@/components/ui/toast";
import { RIDERS, RIDER_KPIS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { exportCsv } from "@/lib/utils";

export default function RidersPage() {
  const { user, can } = useSession();
  const { show } = useToast();
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const base = user.orgId ? RIDERS.filter((r) => r.orgId === user.orgId) : RIDERS;

  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("All organisations");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [permFilter, setPermFilter] = useState("All permission");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((r) => {
      if (q && !`${r.name} ${r.phone} ${r.id}`.toLowerCase().includes(q)) return false;
      if (orgFilter !== "All organisations" && orgName(r.orgId) !== orgFilter) return false;
      if (statusFilter !== "All status" && (statusFilter === "Active") !== (r.status === "active")) return false;
      if (permFilter !== "All permission" && (permFilter === "Allowed") !== r.swapAllowed) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, orgFilter, statusFilter, permFilter]);

  const k = user.orgId
    ? {
        total: base.length,
        active: base.filter((r) => r.status === "active").length,
        suspended: base.filter((r) => r.status === "suspended").length,
        swapsToday: base.reduce((a, r) => a + (r.swaps > 10 ? 2 : 1), 0),
      }
    : RIDER_KPIS;

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Riders refreshed", { description: "Showing the latest records." }); }, 700);
  }

  function handleExport() {
    exportCsv(
      "riders.csv",
      ["Rider", "Rider ID", "Phone", "Organisation", "City", "Vehicle", "Status", "Swaps", "Swap permission"],
      filtered.map((r) => [r.name, r.id, r.phone, orgName(r.orgId), r.city ?? "", r.vehicle ?? "Unassigned", r.status === "active" ? "Active" : "Suspended", r.swaps, r.swapAllowed ? "Allowed" : "Blocked"]),
    );
    show("Riders exported", { description: `${filtered.length} ${filtered.length === 1 ? "row" : "rows"} · riders.csv` });
  }

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
              <SelectField label="Organisation" options={ORGS.map((o) => o.name)} required />
              <Field label="City" placeholder="e.g. New Delhi" optional />
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
        search={query}
        onSearch={setQuery}
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" value={orgFilter} onChange={setOrgFilter} options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Active", "Suspended"]} />
            <FilterSelect label="Swap permission" value={permFilter} onChange={setPermFilter} options={["All permission", "Allowed", "Blocked"]} />
          </>
        }
        actions={
          <>
            <Button variant="secondary" onClick={refresh} disabled={refreshing}><RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh</Button>
            <Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4" /> Export</Button>
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
            {filtered.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No riders match your filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            ) : filtered.map((r) => (
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
                  {can("manage_riders") ? (
                    <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-3.5 w-3.5" /> Edit</>} triggerVariant="secondary" triggerSize="sm" title={`Edit ${r.name}`} description={`Update ${r.id} details.`} submitLabel="Save changes">
                      <Field label="Full name" defaultValue={r.name} required />
                      <Field label="Phone number" defaultValue={r.phone} required />
                      <Field label="City" defaultValue={r.city ?? ""} optional />
                      <SelectField label="Status" options={["Active", "Suspended"]} defaultValue={r.status === "active" ? "Active" : "Suspended"} />
                      <SelectField label="Swap permission" options={["Allowed", "Blocked"]} defaultValue={r.swapAllowed ? "Allowed" : "Blocked"} />
                    </FormDialog>
                  ) : <span className="text-[12px] text-faint">—</span>}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {filtered.length} of {base.length} riders</p>
      </Card>
    </div>
  );
}
