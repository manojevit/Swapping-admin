"use client";

import { useMemo, useRef, useState } from "react";
import { Upload, Plus, RefreshCw, Download, Pencil, Link2, ExternalLink, Bike, CircleCheck, CircleSlash, UserMinus, FileUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { PercentBar } from "@/components/ui/percent-bar";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { RowMenu } from "@/components/ui/row-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { VEHICLES, VEHICLE_KPIS, ORGS, RIDERS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { exportCsv } from "@/lib/utils";

type Vehicle = (typeof VEHICLES)[number];

const MODELS = ["SHEMA LS", "SHEMA", "SHEMA EAGLE"];

export default function VehiclesPage() {
  const { user, can } = useSession();
  const { show } = useToast();
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const base = user.orgId ? VEHICLES.filter((v) => v.orgId === user.orgId) : VEHICLES;

  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("All organisations");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [modelFilter, setModelFilter] = useState("All models");
  const [refreshing, setRefreshing] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleted, setDeleted] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<Vehicle | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((v) => {
      if (deleted.has(v.id)) return false;
      if (q && !`${v.code} ${v.id} ${v.chassis} ${v.rider ?? ""}`.toLowerCase().includes(q)) return false;
      if (orgFilter !== "All organisations" && orgName(v.orgId) !== orgFilter) return false;
      if (statusFilter !== "All status" && (statusFilter === "On road") !== (v.status === "on_road")) return false;
      if (modelFilter !== "All models" && v.model !== modelFilter) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, orgFilter, statusFilter, modelFilter, deleted]);

  const k = user.orgId
    ? {
        total: base.length,
        onRoad: base.filter((v) => v.status === "on_road").length,
        offRoad: base.filter((v) => v.status === "off_road").length,
        unassigned: base.filter((v) => !v.rider).length,
      }
    : VEHICLE_KPIS;

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); show("Vehicles refreshed", { description: "Showing the latest fleet status." }); }, 700);
  }

  function handleExport() {
    exportCsv(
      "vehicles.csv",
      ["Vehicle", "Code", "Chassis", "Organisation", "Model", "Rider", "Battery", "Charge", "Status", "Location", "Swaps"],
      filtered.map((v) => [v.id, v.code, v.chassis, orgName(v.orgId), v.model, v.rider ?? "Unassigned", v.batteryId ?? "", v.charge ?? "", v.status === "on_road" ? "On road" : "Off road", v.location, v.swaps]),
    );
    show("Vehicles exported", { description: `${filtered.length} ${filtered.length === 1 ? "row" : "rows"} · vehicles.csv` });
  }

  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle="Manage and monitor all registered vehicles in your fleet"
        actions={
          can("manage_vehicles") ? (
            <>
              <Button variant="secondary" size="lg" onClick={() => setBulkOpen(true)}><Upload className="h-4 w-4" /> Bulk upload</Button>
              <FormDialog icon={<Bike className="h-5 w-5" />} trigger={<><Plus className="h-4 w-4" /> Add vehicle</>} title="Add vehicle" description="Register a vehicle to the fleet." submitLabel="Add vehicle">
                <Field label="Vehicle code" placeholder="e.g. EVX-010" required />
                <Field label="Chassis number" placeholder="SESEAG032600..." required />
                <SelectField label="Model" options={MODELS} required />
                <SelectField label="Organisation" options={ORGS.map((o) => o.name)} required />
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
        search={query}
        onSearch={setQuery}
        filters={
          <>
            {can("view_all_orgs") ? <FilterSelect label="Organisation" value={orgFilter} onChange={setOrgFilter} options={["All organisations", ...ORGS.map((o) => o.name)]} /> : null}
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All status", "On road", "Off road"]} />
            <FilterSelect label="Model" value={modelFilter} onChange={setModelFilter} options={["All models", ...MODELS]} />
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
            {filtered.length === 0 ? (
              <TR><TD className="py-10 text-center text-muted">No vehicles match your filters.</TD><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /><TD /></TR>
            ) : filtered.map((v) => (
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
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.location)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink hover:text-brand-600">
                    {v.location}<ExternalLink className="h-3 w-3 text-brand-600" />
                  </a>
                </TD>
                <TD align="right" className="nums font-semibold text-ink">{v.swaps}</TD>
                <TD align="right">
                  {can("manage_vehicles") ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <FormDialog icon={<Link2 className="h-5 w-5" />} trigger={<><Link2 className="h-3.5 w-3.5" /> {v.rider ? "Reassign" : "Assign"}</>} triggerVariant="secondary" triggerSize="sm" title={`${v.rider ? "Reassign" : "Assign"} ${v.code}`} description="Link this vehicle to a rider." submitLabel={v.rider ? "Reassign" : "Assign rider"}>
                        <SelectField label="Rider" options={["Unassigned", ...RIDERS.map((r) => r.name)]} defaultValue={v.rider ?? "Unassigned"} required />
                      </FormDialog>
                      <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-3.5 w-3.5" /> Edit</>} triggerVariant="secondary" triggerSize="sm" title={`Edit ${v.code}`} description={`Update ${v.id} details.`} submitLabel="Save changes">
                        <Field label="Vehicle code" defaultValue={v.code} required />
                        <Field label="Chassis number" defaultValue={v.chassis} required />
                        <SelectField label="Model" options={MODELS} defaultValue={v.model} required />
                        <SelectField label="Status" options={["On road", "Off road"]} defaultValue={v.status === "on_road" ? "On road" : "Off road"} />
                      </FormDialog>
                      <RowMenu
                        items={[
                          { label: v.status === "on_road" ? "Take off road" : "Put on road", onClick: () => show(v.status === "on_road" ? "Vehicle taken off road" : "Vehicle put on road", { description: v.code, tone: "warn" }) },
                          { label: "Delete vehicle", danger: true, divider: true, onClick: () => setPending(v) },
                        ]}
                      />
                    </div>
                  ) : <span className="text-[12px] text-faint">—</span>}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">Showing {filtered.length} of {base.length} vehicles</p>
      </Card>

      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => { if (pending) { const id = pending.id; setDeleted((s) => new Set(s).add(id)); show("Vehicle deleted", { description: pending.code, tone: "warn" }); } }}
        title={`Delete ${pending?.code ?? ""}?`}
        description="This removes the vehicle from the fleet. Consider taking it off road instead to keep its history."
        confirmLabel="Delete vehicle"
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
    show("Vehicles uploaded", { description: `${file.name} queued for processing.` });
    setFile(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => { setFile(null); onClose(); }}
      icon={<Upload className="h-5 w-5" />}
      title="Bulk upload vehicles"
      description="Register many vehicles at once from a CSV."
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
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/[0.045] text-muted"><FileUp className="h-5 w-5" /></span>
        <span className="text-[13px] font-semibold text-ink">{file ? file.name : "Choose a CSV file"}</span>
        <span className="text-[12px] text-faint">{file ? "Click to replace" : "or drag and drop here"}</span>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </button>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">Expected columns: code, chassis, model, organisation. Rows with an existing code are skipped.</p>
    </Modal>
  );
}
