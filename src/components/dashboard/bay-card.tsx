import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bay, BayState } from "@/lib/types";

const STYLES: Record<BayState, { wrap: string; label: string; text: string }> = {
  charged: { wrap: "border-success/30 bg-success-soft/40", label: "CHARGED", text: "text-success-ink" },
  charging: { wrap: "border-warn/30 bg-warn-soft/40", label: "CHARGING", text: "text-warn-ink" },
  empty: { wrap: "border-line bg-surface", label: "EMPTY", text: "text-faint" },
  faulted: { wrap: "border-danger/30 bg-danger-soft/40", label: "FAULTED", text: "text-danger-ink" },
};

export function BayCard({ bay }: { bay: Bay }) {
  const s = STYLES[bay.state];
  const filled = bay.state === "charged" || bay.state === "charging";
  return (
    <div className={cn("rounded-2xl border p-4", s.wrap)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Bay {String(bay.index).padStart(2, "0")}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="nums text-[22px] font-bold text-ink">{bay.soc !== null ? `${bay.soc}%` : "—"}</span>
            <span className={cn("text-[12px] font-semibold", s.text)}>{s.label}</span>
          </p>
          <p className="nums mt-1 text-[12px] text-muted">{bay.serial ?? "No pack"}</p>
          <p className="nums mt-0.5 text-[12px] text-faint">
            {filled ? `${bay.voltage}V · ${bay.current}A · ${bay.temp}°C · SoH —` : "—"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-semibold text-muted">{bay.flap.toUpperCase()}</span>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px] font-semibold text-muted hover:text-ink">
          <Cpu className="h-3.5 w-3.5" /> BMS
        </button>
      </div>
    </div>
  );
}
