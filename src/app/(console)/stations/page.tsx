"use client";

import Link from "next/link";
import { Plus, Download, RefreshCw, QrCode, KeyRound, Pencil, Radio, CircleDot, CircleOff, Wrench, Database, Package, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { BayBar } from "@/components/ui/bay-bar";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { STATIONS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { timeAgo } from "@/lib/utils";
import type { StationStatus } from "@/lib/types";

const TONE: Record<StationStatus, "success" | "danger" | "warn" | "neutral"> = {
  online: "success", offline: "danger", maintenance: "warn", unknown: "neutral",
};
const LABEL: Record<StationStatus, string> = {
  online: "Online", offline: "Offline", maintenance: "Maintenance", unknown: "Unknown",
};

export default function StationsPage() {
  const { user, can } = useSession();
  const rows = user.orgId ? STATIONS.filter((s) => s.orgId === user.orgId) : STATIONS;
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const k = {
    total: rows.length,
    online: rows.filter((s) => s.status === "online").length,
    offline: rows.filter((s) => s.status === "offline").length,
    maintenance: rows.filter((s) => s.status === "maintenance").length,
    totalSlots: rows.reduce((a, s) => a + s.baysTotal, 0),
    readySlots: rows.reduce((a, s) => a + s.readyPacks, 0),
  };

  return (
    <div>
      <PageHeader
        title="Stations"
        subtitle="Manage and monitor battery swapping stations"
        actions={
          can("manage_stations") ? (
            <FormDialog icon={<Radio className="h-5 w-5" />} trigger={<><Plus className="h-4 w-4" /> Add station</>} title="Add station" description="Register a new swapping station." submitLabel="Add station">
              <Field label="Station code" placeholder="e.g. EVX-PKL-0002" required />
              <Field label="Display name" placeholder="e.g. EVX-SECTOR 20" optional />
              <SelectField label="Organisation" options={ORGS.map((o) => o.name)} required />
              <Field label="Location" placeholder="City, State" required />
              <Field label="Total bays" type="number" placeholder="9" required />
            </FormDialog>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={<Radio className="h-5 w-5" />} label="Total Stations" value={k.total} sub="All registered stations" tone="brand" />
        <KpiCard icon={<CircleDot className="h-5 w-5" />} label="Online" value={k.online} sub="Stations online" tone="success" />
        <KpiCard icon={<CircleOff className="h-5 w-5" />} label="Offline" value={k.offline} sub="Stations offline" tone="danger" />
        <KpiCard icon={<Wrench className="h-5 w-5" />} label="Maintenance" value={k.maintenance} sub="Under maintenance" tone="warn" />
        <KpiCard icon={<Database className="h-5 w-5" />} label="Total Slots" value={k.totalSlots} sub="Across all stations" tone="info" />
        <KpiCard icon={<Package className="h-5 w-5" />} label="Ready Slots" value={k.readySlots} sub="Available for swap" tone="brand" />
      </div>

      <Toolbar
        placeholder="Search station code, name or city…"
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="Status" options={["All status", "Online", "Offline", "Maintenance"]} />
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
            <TH>Station</TH>
            <TH>Organisation</TH>
            <TH>Location</TH>
            <TH>Bays</TH>
            <TH>Last seen</TH>
            <TH>Status</TH>
            <TH align="right">Actions</TH>
          </THead>
          <TBody>
            {rows.map((s) => (
              <TR key={s.id}>
                <TD>
                  <Link href={`/stations/${s.id}`} className="text-[14px] font-semibold text-ink hover:text-brand-600">{s.name}</Link>
                  <p className="nums text-[12px] text-faint">{s.code}</p>
                </TD>
                <TD className="font-medium">{orgName(s.orgId)}</TD>
                <TD>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-faint" />{s.location}</span>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <BayBar full={s.baysFull} total={s.baysTotal} tone={s.status === "offline" ? "offline" : "auto"} />
                    <span className="text-[12px] text-faint">· {s.readyPacks} ready</span>
                  </div>
                </TD>
                <TD>{timeAgo(s.lastSeen)}</TD>
                <TD><StatusPill tone={TONE[s.status]}>{LABEL[s.status]}</StatusPill></TD>
                <TD align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="secondary" size="sm"><QrCode className="h-3.5 w-3.5" /> QR</Button>
                    <Button variant="secondary" size="sm"><KeyRound className="h-3.5 w-3.5" /> Key</Button>
                    <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-3.5 w-3.5" /> Edit</>} triggerVariant="secondary" triggerSize="sm" title={`Edit ${s.code}`} description="Update station details." submitLabel="Save changes">
                      <Field label="Display name" defaultValue={s.name} required />
                      <Field label="Location" defaultValue={s.location} required />
                      <SelectField label="Status" options={["Online", "Offline", "Maintenance"]} defaultValue={LABEL[s.status]} required />
                    </FormDialog>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {rows.length} of {rows.length} stations</p>
      </Card>
    </div>
  );
}
