"use client";

import { useMemo, useRef, useState } from "react";
import { Upload, Plus, RefreshCw, Download, ArrowLeftRight, Pencil, BatteryFull, HeartPulse, BatteryLow, TriangleAlert, Car, Radio, FileUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PercentBar } from "@/components/ui/percent-bar";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { RowMenu } from "@/components/ui/row-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { BATTERIES, BATTERY_KPIS, ORGS, STATIONS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { exportCsv, timeAgo } from "@/lib/utils";

type Battery = (typeof BATTERIES)[number];
import type { BatteryHealth } from "@/lib/types";

const HEALTH_LABEL: Record<BatteryHealth, string> = { healthy: "Healthy", low: "Low", fault: "Fault", unknown: "Unknown" };

export default function BatteriesPage() {
  const { user, can } = useSession();
  const { show } = useToast();
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const base = user.orgId ? BATTERIES.filter((b) => b.orgId === user.orgId) : BATTERIES;

  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("All organisations");
  const [stationFilter, setStationFilter] = useState("All stations");
  const [refreshing, setRefreshing] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleted, setDeleted] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<Battery | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((b) => {
      if (deleted.has(b.id)) return false;
      if (q && !`${b.id} ${b.brand}`.toLowerCase().includes(q)) return false;
      if (orgFilter !== "All organisations" && orgName(b.orgId) !== orgFilter) return false;
      if (stationFilter !== "All stations" && !b.whereLabel.includes(stationFilter)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, orgFilter, stationFilter, deleted]);

  const k = user.orgId
    ? {
        total: base.length,
        healthy: base.filter((b) => b.health === "healthy").length,
        low: base.filter((b) => b.health === "low").length,
        fault: base.filter((b) => b.health === "fault").length,
      }
    : BATTERY_KPIS;

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Batteries refreshed", { description: "Showing the latest telemetry." }); }, 700);
  }

  function handleExport() {
    exportCsv(
      "batteries.csv",
      ["Serial", "Brand", "Organisation", "Where", "SOC", "SOH", "Health", "Updated"],
      filtered.map((b) => [b.id, b.brand, orgName(b.orgId), b.whereLabel, b.soc, b.soh, HEALTH_LABEL[b.health], new Date(b.updatedAt).toISOString()]),
    );
    show("Batteries exported", { description: `${filtered.length} ${filtered.length === 1 ? "row" : "rows"} · batteries.csv` });
  }

  return (
    <div>
      <PageHeader
        title="Battery Inventory"
        subtitle="Manage and monitor all batteries in your network"
        actions={
          can("manage_batteries") ? (
            <>
              <Button variant="secondary" size="lg" onClick={() => setBulkOpen(true)}><Upload className="h-4 w-4" /> Bulk upload</Button>
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
        search={query}
        onSearch={setQuery}
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" value={orgFilter} onChange={setOrgFilter} options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="In station" value={stationFilter} onChange={setStationFilter} options={["All stations", ...STATIONS.map((s) => s.code)]} />
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
            {filtered.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No batteries match your filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            ) : filtered.map((b) => (
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
                  {can("manage_batteries") ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <FormDialog icon={<ArrowLeftRight className="h-5 w-5" />} trigger={<><ArrowLeftRight className="h-3.5 w-3.5" /> Move</>} triggerVariant="secondary" triggerSize="sm" title={`Move ${b.id}`} description="Move this pack to a station bay or a vehicle." submitLabel="Move pack">
                        <SelectField label="Move to" options={["Choose a destination", ...STATIONS.map((s) => s.code), "Vehicle (assign to rider)"]} required />
                        <Field label="Reason" placeholder="Rebalancing stock across stations" optional />
                      </FormDialog>
                      <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-3.5 w-3.5" /> Edit</>} triggerVariant="secondary" triggerSize="sm" title={`Edit ${b.id}`} description="Update battery details." submitLabel="Save changes">
                        <Field label="Brand" defaultValue={b.brand} required />
                        <SelectField label="Organisation" options={ORGS.map((o) => o.name)} defaultValue={orgName(b.orgId)} required />
                        <SelectField label="Health" options={["Healthy", "Low", "Fault"]} defaultValue={HEALTH_LABEL[b.health]} required />
                      </FormDialog>
                      <RowMenu
                        items={[
                          { label: "Retire battery", onClick: () => show("Battery retired", { description: b.id, tone: "warn" }) },
                          { label: "Delete battery", danger: true, divider: true, onClick: () => setPending(b) },
                        ]}
                      />
                    </div>
                  ) : <span className="text-[12px] text-faint">—</span>}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {filtered.length} of {k.total} batteries</p>
      </Card>

      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => { if (pending) { const id = pending.id; setDeleted((s) => new Set(s).add(id)); show("Battery deleted", { description: pending.id, tone: "warn" }); } }}
        title={`Delete ${pending?.id ?? ""}?`}
        description="This removes the pack from inventory. Consider Retire to keep its telemetry history."
        confirmLabel="Delete battery"
      />
    </div>
  );
}

function BulkUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { show } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function upload() {
    if (!file) return;
    show("Batteries uploaded", { description: `${file.name} queued for processing.` });
    setFile(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => { setFile(null); onClose(); }}
      icon={<Upload className="h-5 w-5" />}
      title="Bulk upload batteries"
      description="Register many packs at once from a CSV."
      footer={
        <>
          <Button variant="secondary" onClick={() => { setFile(null); onClose(); }}>Cancel</Button>
          <Button variant="primary" disabled={!file} onClick={upload}>Upload{file ? "" : " file"}</Button>
        </>
      }
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-canvas/40 px-4 py-8 text-center transition-colors hover:border-brand-300 hover:bg-canvas"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><FileUp className="h-5 w-5" /></span>
        <span className="text-[13px] font-semibold text-ink">{file ? file.name : "Choose a CSV file"}</span>
        <span className="text-[12px] text-faint">{file ? "Click to replace" : "or drag and drop here"}</span>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </button>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">Expected columns: serial, brand, organisation, station. Rows with an existing serial are skipped.</p>
    </Modal>
  );
}
