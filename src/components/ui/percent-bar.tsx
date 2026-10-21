import { cn } from "@/lib/utils";

/** A compact value bar used for SoC / SoH / charge cells. */
export function PercentBar({ value, width = "w-16" }: { value: number; width?: string }) {
  const color = value <= 20 ? "bg-danger" : value <= 60 ? "bg-warn" : "bg-success";
  return (
    <div className="flex items-center gap-2">
      <span className="nums w-9 text-[13px] font-semibold text-ink">{value}%</span>
      <div className={cn("h-2 overflow-hidden rounded-full bg-black/10", width)}>
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
