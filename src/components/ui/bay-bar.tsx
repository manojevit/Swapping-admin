import { cn } from "@/lib/utils";

/**
 * The little bays progress bar used in the station tables.
 * Colour follows the fill ratio: healthy green, partial amber, empty/offline red-ish.
 */
export function BayBar({
  full,
  total,
  tone,
}: {
  full: number;
  total: number;
  tone?: "auto" | "offline";
}) {
  const ratio = total > 0 ? full / total : 0;
  const color =
    tone === "offline" || ratio === 0
      ? "bg-danger"
      : ratio < 0.5
        ? "bg-warn"
        : "bg-success";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-black/10">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.max(ratio * 100, full > 0 ? 8 : 6)}%` }} />
      </div>
      <span className="nums text-[13px] text-muted">
        {full}/{total}
      </span>
    </div>
  );
}
