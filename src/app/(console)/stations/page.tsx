"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Download, RefreshCw, QrCode, Pencil, Radio, CircleDot, CircleOff, Wrench, Database, Package, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { BayBar } from "@/components/ui/bay-bar";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { QrModal } from "@/components/dashboard/station-modals";
import { useToast } from "@/components/ui/toast";
import { STATIONS, ORGS, getStationDetail } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { exportCsv } from "@/lib/utils";
import type { StationDetail, StationStatus } from "@/lib/types";

const TONE: Record<StationStatus, "success" | "danger" | "warn" | "neutral"> = {
  online: "success", offline: "danger", maintenance: "warn", unknown: "neutral",
};
const LABEL: Record<StationStatus, string> = {
  online: "Online", offline: "Offline", maintenance: "Maintenance", unknown: "Unknown",
};

export default function StationsPage() {
  const { user, can } = useSession();
  const { show } = useToast();
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const rows = user.orgId ? STATIONS.filter((s) => s.orgId === user.orgId) : STATIONS;

  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("All organisations");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [refreshing, setRefreshing] = useState(false);
  const [qrStation, setQrStation] = useState<StationDetail | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((s) => {
      if (q && !`${s.name} ${s.code} ${s.location}`.toLowerCase().includes(q)) return false;
      if (orgFilter !== "All organisations" && orgName(s.orgId) !== orgFilter) return false;
      if (statusFilter !== "All status" && LABEL[s.status] !== statusFilter) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, orgFilter, statusFilter]);

  const k = {
    total: rows.length,
    online: rows.filter((s) => s.status === "online").length,
    offline: rows.filter((s) => s.status === "offline").length,
    maintenance: rows.filter((s) => s.status === "maintenance").length,
    totalSlots: rows.reduce((a, s) => a + s.baysTotal, 0),
    readySlots: rows.reduce((a, s) => a + s.readyPacks, 0),
  };

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Stations refreshed", { description: "Showing the latest status." }); }, 700);
  }

  function handleExport() {
    exportCsv(
      "stations.csv",
      ["Station", "Code", "Organisation", "Location", "Bays full", "Bays total", "Ready packs", "Status", "Last seen", "Faults"],
      filtered.map((s) => [s.name, s.code, orgName(s.orgId), s.location, s.baysFull, s.baysTotal, s.readyPacks, LABEL[s.status], new Date(s.lastSeen).toISOString(), s.faults]),
    );
    show("Stations exported", { description: `${filtered.length} ${filtered.length === 1 ? "row" : "rows"} · stations.csv` });
  }

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
        search={query}
        onSearch={setQuery}
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" value={orgFilter} onChange={setOrgFilter} options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Online", "Offline", "Maintenance"]} />
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
            <TH>Station</TH>
            <TH>Organisation</TH>
            <TH>Location</TH>
            <TH>Bays</TH>
            <TH>Status</TH>
            <TH align="right">Actions</TH>
          </THead>
          <TBody>
            {filtered.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No stations match your filters.</TD><TD /><TD /><TD /><TD /><TD /></TR>
            ) : filtered.map((s) => (
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
                <TD><StatusPill tone={TONE[s.status]}>{LABEL[s.status]}</StatusPill></TD>
                <TD align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => setQrStation(getStationDetail(s.id))}><QrCode className="h-3.5 w-3.5" /> QR</Button>
                    {can("manage_stations") ? (
                      <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-3.5 w-3.5" /> Edit</>} triggerVariant="secondary" triggerSize="sm" title={`Edit ${s.code}`} description="Update station details." submitLabel="Save changes">
                        <Field label="Display name" defaultValue={s.name} required />
                        <Field label="Location" defaultValue={s.location} required />
                        <SelectField label="Status" options={["Online", "Offline", "Maintenance"]} defaultValue={LABEL[s.status]} required />
                      </FormDialog>
                    ) : null}
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {filtered.length} of {rows.length} stations</p>
      </Card>

      {qrStation ? <QrModal open onClose={() => setQrStation(null)} station={qrStation} /> : null}
    </div>
  );
}
