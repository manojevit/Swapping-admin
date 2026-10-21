"use client";

import { LockOpen, TriangleAlert, RotateCcw, RefreshCw, FileDown, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { StatusPill } from "@/components/ui/status-pill";
import type { StationDetail } from "@/lib/types";

function Panel({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-[13px] text-muted">{blurb}</p>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

const fieldCls =
  "h-10 w-full rounded-xl border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-faint focus:border-brand-300 focus:bg-surface focus:outline-none";

export function StationControls({ station }: { station: StationDetail }) {
  function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Force a flap open" blurb="For a bay the cabinet is refusing — a slot fault, a stranded pack. It does not touch a swap in progress.">
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <label className="text-[12px] font-semibold uppercase tracking-wide text-faint">
              Bay
              <select className={fieldCls + " mt-1.5"}>
                {station.bays.map((b) => (
                  <option key={b.index}>{b.index}</option>
                ))}
              </select>
            </label>
            <label className="text-[12px] font-semibold uppercase tracking-wide text-faint">
              Why
              <input className={fieldCls + " mt-1.5"} placeholder="Pack stranded after a failed swap" />
            </label>
          </div>
          <Button variant="danger" className="mt-4"><LockOpen className="h-4 w-4" /> Force bay open</Button>
          <p className="mt-2 text-[12px] text-faint">A reason is required — it goes in the command log against your name.</p>
        </Panel>

        <Panel title="End a stuck swap" blurb="A station will only run one swap at a time. If one is stuck, nobody else can swap here until it is closed.">
          <label className="text-[12px] font-semibold uppercase tracking-wide text-faint">
            What actually happened
            <select className={fieldCls + " mt-1.5"}>
              <option>Choose — there is no default</option>
              <option>Rider left with their own pack</option>
              <option>Flap would not close</option>
              <option>Cabinet unresponsive mid-swap</option>
            </select>
          </label>
          <label className="mt-3 block text-[12px] font-semibold uppercase tracking-wide text-faint">
            Note
            <input className={fieldCls + " mt-1.5"} placeholder="Rider left; bay 4 flap would not close" />
          </label>
          <Button variant="danger" className="mt-4"><TriangleAlert className="h-4 w-4" /> End this swap</Button>
        </Panel>

        <Panel title="Faults" blurb="Clears a latch, never a condition. If the emergency stop is still pressed, the cabinet re-latches on its next scan — which is how you tell the two apart.">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary"><ShieldCheck className="h-4 w-4" /> Clear the cabinet latches</Button>
            <Button variant="secondary"><RotateCcw className="h-4 w-4" /> Ask for a fresh frame</Button>
          </div>
        </Panel>

        <Panel title="The station QR" blurb="Encodes a deep link with this station's own rotatable token, so a photographed sticker can be killed without reprinting every other one on the network.">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary"><FileDown className="h-4 w-4" /> PNG, 1024 px</Button>
            <Button variant="secondary"><FileDown className="h-4 w-4" /> SVG for print</Button>
          </div>
        </Panel>
      </div>

      <Card>
        <div className="flex items-center gap-2 px-5 pt-5">
          <RefreshCw className="h-4 w-4 text-brand-600" />
          <h3 className="text-[15px] font-semibold text-ink">Commands sent to this cabinet</h3>
        </div>
        <div className="mt-4">
          <Table>
            <THead>
              <TH>When</TH>
              <TH>Bay</TH>
              <TH>What</TH>
              <TH align="right">Delivered</TH>
            </THead>
            <TBody>
              {station.commands.length === 0 ? (
                <TR>
                  <TD className="text-faint">No commands sent recently.</TD>
                  <TD /><TD /><TD />
                </TR>
              ) : (
                station.commands.map((c, i) => (
                  <TR key={i}>
                    <TD className="text-ink">{fmt(c.at)}</TD>
                    <TD className="nums">{c.bay}</TD>
                    <TD className="font-medium text-ink">{c.what}</TD>
                    <TD align="right">
                      <StatusPill tone={c.delivered ? "success" : "danger"}>
                        {c.delivered ? "Reached the cabinet" : "Not delivered"}
                      </StatusPill>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
