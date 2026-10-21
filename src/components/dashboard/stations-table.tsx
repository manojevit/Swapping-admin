"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { STATIONS, ORGS } from "@/lib/mock";
import { useSession } from "@/lib/session";
import { useToast } from "@/components/ui/toast";
import { StatusPill } from "@/components/ui/status-pill";
import { BayBar } from "@/components/ui/bay-bar";
import { Button } from "@/components/ui/button";
import { exportCsv, timeAgo } from "@/lib/utils";
import type { StationStatus } from "@/lib/types";

const STATUS_TONE: Record<StationStatus, "success" | "danger" | "warn" | "neutral"> = {
  online: "success", offline: "danger", maintenance: "warn", unknown: "neutral",
};
const STATUS_LABEL: Record<StationStatus, string> = {
  online: "Online", offline: "Offline", maintenance: "Maintenance", unknown: "Unknown",
};

export function StationsTable() {
  const { user, can } = useSession();
  const { show } = useToast();
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? "—";

  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const base = user.orgId ? STATIONS.filter((s) => s.orgId === user.orgId) : STATIONS;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((s) => {
      if (q && !`${s.name} ${s.code} ${s.location}`.toLowerCase().includes(q)) return false;
      if (orgFilter !== "all" && orgName(s.orgId) !== orgFilter) return false;
      if (statusFilter !== "all" && STATUS_LABEL[s.status] !== statusFilter) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, orgFilter, statusFilter]);

  function handleExport() {
    exportCsv(
      "stations.csv",
      ["Station", "Code", "Organisation", "Location", "Bays full", "Bays total", "Status", "Last seen", "Faults"],
      rows.map((s) => [s.name, s.code, orgName(s.orgId), s.location, s.baysFull, s.baysTotal, STATUS_LABEL[s.status], new Date(s.lastSeen).toISOString(), s.faults]),
    );
    show("Stations exported", { description: `${rows.length} ${rows.length === 1 ? "row" : "rows"} · stations.csv` });
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 pb-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stations by name or location…"
            className="h-9 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-[13px] placeholder:text-faint focus:border-brand-300 focus:bg-surface focus:outline-none"
          />
        </div>
        {can("view_all_orgs") ? (
          <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className="h-9 rounded-xl border border-line bg-surface px-3 text-[13px] text-ink">
            <option value="all">All organisations</option>
            {ORGS.map((o) => (<option key={o.id} value={o.name}>{o.name}</option>))}
          </select>
        ) : null}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-xl border border-line bg-surface px-3 text-[13px] text-ink">
          <option value="all">All status</option>
          <option>Online</option>
          <option>Offline</option>
          <option>Maintenance</option>
        </select>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y border-line bg-canvas/60 text-[11px] uppercase tracking-wide text-faint">
              <th className="px-5 py-2.5 font-semibold">Station</th>
              <th className="px-3 py-2.5 font-semibold">Organisation</th>
              <th className="px-3 py-2.5 font-semibold">Location</th>
              <th className="px-3 py-2.5 font-semibold">Bays</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold">Last seen</th>
              <th className="px-3 py-2.5 font-semibold">Faults</th>
              <th className="px-5 py-2.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-muted">No stations match your filters.</td></tr>
            ) : rows.map((s) => (
              <tr key={s.id} className="hover:bg-canvas/60">
                <td className="px-5 py-3.5">
                  <Link href={`/stations/${s.id}`} className="text-[14px] font-semibold text-ink hover:text-brand-600">{s.name}</Link>
                  <p className="nums text-[12px] text-faint">{s.code}</p>
                </td>
                <td className="px-3 py-3.5 text-[13px] font-medium text-muted">{orgName(s.orgId)}</td>
                <td className="px-3 py-3.5 text-[13px] text-muted">{s.location}</td>
                <td className="px-3 py-3.5">
                  <BayBar full={s.baysFull} total={s.baysTotal} tone={s.status === "offline" ? "offline" : "auto"} />
                </td>
                <td className="px-3 py-3.5">
                  <StatusPill tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</StatusPill>
                </td>
                <td className="px-3 py-3.5 text-[13px] text-muted">{timeAgo(s.lastSeen)}</td>
                <td className="nums px-3 py-3.5 text-[13px] font-semibold">
                  <span className={s.faults > 0 ? "text-danger" : "text-muted"}>{s.faults}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/stations/${s.id}`} className="inline-flex h-8 items-center rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-canvas">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="px-5 py-3 text-[12px] text-faint">
        Showing {rows.length} of {base.length} stations
      </p>
    </div>
  );
}
