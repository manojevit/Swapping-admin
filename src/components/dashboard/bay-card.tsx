import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bay, BayState } from "@/lib/types";

const STYLE: Record<BayState, { wrap: string; bar: string; dot: string; text: string; label: string }> = {
  charged: { wrap: "border-success/25 bg-success-soft/30", bar: "bg-success", dot: "bg-success", text: "text-success-ink", label: "Charged" },
  charging: { wrap: "border-warn/25 bg-warn-soft/30", bar: "bg-warn", dot: "bg-warn", text: "text-warn-ink", label: "Charging" },
  empty: { wrap: "border-line bg-surface", bar: "bg-black/10", dot: "bg-faint", text: "text-faint", label: "Empty" },
  faulted: { wrap: "border-danger/25 bg-danger-soft/30", bar: "bg-danger", dot: "bg-danger", text: "text-danger-ink", label: "Faulted" },
};

export function BayCard({ bay, onBms }: { bay: Bay; onBms?: (bay: Bay) => void }) {
  const s = STYLE[bay.state];
  const filled = bay.state === "charged" || bay.state === "charging";
  return (
    <div className={cn("rounded-xl border p-3.5", s.wrap)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
          Bay {String(bay.index).padStart(2, "0")}
        </span>
        <span className={cn("flex items-center gap-1.5 text-[11px] font-semibold", s.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
      </div>

      <p className="nums mt-2 text-[20px] font-bold leading-none text-ink">
        {bay.soc !== null ? `${bay.soc}%` : "—"}
      </p>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
        <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${bay.soc ?? 0}%` }} />
      </div>

      <p className="nums mt-2.5 truncate text-[12px] text-muted">{bay.serial ?? "No pack"}</p>
      <p className="nums mt-0.5 truncate text-[11px] text-faint">
        {filled ? `${bay.voltage}V · ${bay.current}A · ${bay.temp}°C` : "Slot empty"}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-md bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          {bay.flap}
        </span>
        <button
          type="button"
          onClick={() => onBms?.(bay)}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-brand-200 hover:text-brand-700"
        >
          <Cpu className="h-3.5 w-3.5" /> BMS
        </button>
      </div>
    </div>
  );
}
