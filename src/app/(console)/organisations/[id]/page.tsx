"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ChevronRight, Pencil, Archive, Trash2, Building2, Radio, Users, Bike, BatteryCharging, MapPin, Hash, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { BayBar } from "@/components/ui/bay-bar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ORGS, ORG_STATS, STATIONS } from "@/lib/mock";
import { timeAgo } from "@/lib/utils";
import type { StationStatus } from "@/lib/types";

const TONE: Record<StationStatus, "success" | "danger" | "warn" | "neutral"> = {
  online: "success", offline: "danger", maintenance: "warn", unknown: "neutral",
};

export default function OrganisationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { show } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const org = ORGS.find((o) => o.id === params.id);
  if (!org) notFound();
  const s = ORG_STATS[org.id];
  const stations = STATIONS.filter((st) => st.orgId === org.id);

  return (
    <div>
      <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted">
        <Link href="/overview" className="hover:text-ink">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5 text-faint" />
        <Link href="/organisations" className="hover:text-ink">Organisations</Link>
        <ChevronRight className="h-3.5 w-3.5 text-faint" />
        <span className="font-medium text-ink">{org.name}</span>
      </nav>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">{org.name}</h1>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[12px] font-semibold text-brand-700">{org.code}</span>
            <StatusPill tone="success">Active</StatusPill>
          </div>
          <p className="mt-1 text-[14px] text-muted">{s.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-4 w-4" /> Edit</>} title={`Edit ${org.name}`} description="Update organisation details." submitLabel="Save changes">
            <Field label="Organisation name" defaultValue={org.name} required />
            <Field label="Code" defaultValue={org.code} required />
            <Field label="City" defaultValue={org.city} optional />
            <SelectField label="Status" options={["Active", "Inactive"]} required />
          </FormDialog>
          <Button variant="secondary" onClick={() => show("Organisation archived", { description: org.name, tone: "warn" })}><Archive className="h-4 w-4" /> Archive</Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={<Radio className="h-5 w-5" />} label="Stations" value={s.stations} sub="In this organisation" tone="brand" />
        <KpiCard icon={<Users className="h-5 w-5" />} label="Riders" value={s.riders} sub="Registered riders" tone="info" />
        <KpiCard icon={<Bike className="h-5 w-5" />} label="Vehicles" value={s.vehicles} sub="In the fleet" tone="violet" />
        <KpiCard icon={<BatteryCharging className="h-5 w-5" />} label="Batteries" value={s.batteries} sub="In inventory" tone="success" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
        <Card>
          <div className="flex items-center gap-2 px-5 pt-5">
            <Radio className="h-4 w-4 text-brand-600" />
            <h3 className="text-[15px] font-semibold text-ink">Stations</h3>
            <span className="text-[13px] text-muted">· {stations.length}</span>
          </div>
          <div className="mt-3">
            {stations.length === 0 ? (
              <p className="px-5 pb-5 text-[13px] text-muted">No stations registered under this organisation yet.</p>
            ) : (
              <Table>
                <THead><TH>Station</TH><TH>Location</TH><TH>Bays</TH><TH>Status</TH><TH>Last seen</TH><TH align="right">Open</TH></THead>
                <TBody>
                  {stations.map((st) => (
                    <TR key={st.id}>
                      <TD><Link href={`/stations/${st.id}`} className="font-semibold text-ink hover:text-brand-600">{st.name}</Link><p className="nums text-[12px] text-faint">{st.code}</p></TD>
                      <TD>{st.location}</TD>
                      <TD><BayBar full={st.baysFull} total={st.baysTotal} tone={st.status === "offline" ? "offline" : "auto"} /></TD>
                      <TD><StatusPill tone={TONE[st.status]}>{st.status[0].toUpperCase() + st.status.slice(1)}</StatusPill></TD>
                      <TD>{timeAgo(st.lastSeen)}</TD>
                      <TD align="right"><Link href={`/stations/${st.id}`} className="inline-flex h-8 items-center rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-canvas">Open</Link></TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-ink">Organisation information</h3>
          <div className="mt-3 space-y-3.5">
            <Info icon={<Hash className="h-4 w-4" />} label="Code" value={org.code} />
            <Info icon={<MapPin className="h-4 w-4" />} label="City" value={org.city} />
            <Info icon={<Building2 className="h-4 w-4" />} label="Description" value={s.description} />
            <Info icon={<CalendarDays className="h-4 w-4" />} label="Created" value={s.createdAt} />
          </div>
        </Card>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        icon={<Trash2 className="h-5 w-5" />}
        title={`Delete ${org.name}?`}
        description="This permanently removes the organisation and unlinks its stations, riders and vehicles."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setConfirmDelete(false); show("Organisation deleted", { description: org.name, tone: "warn" }); router.push("/organisations"); }}>Delete organisation</Button>
          </>
        }
      >
        <p className="text-[13px] text-muted">Type of action: <span className="font-semibold text-ink">destructive</span>. This cannot be undone.</p>
      </Modal>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-faint">{label}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-ink">{value}</p>
      </div>
    </div>
  );
}
