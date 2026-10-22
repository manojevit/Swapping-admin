import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "brand" | "success" | "warn" | "danger" | "info" | "violet" | "neutral";

// Decorative tones (brand/info/violet) render monochrome; only semantic
// status tones keep colour, so KPI rows read as data rather than a rainbow.
const NEUTRAL = "bg-ink/[0.045] text-muted";
const ICON_TONES: Record<Tone, string> = {
  brand: NEUTRAL,
  info: NEUTRAL,
  violet: NEUTRAL,
  neutral: NEUTRAL,
  success: "bg-success-soft text-success-ink",
  warn: "bg-warn-soft text-warn-ink",
  danger: "bg-danger-soft text-danger-ink",
};

export function KpiCard({
  icon,
  label,
  value,
  sub,
  tone = "brand",
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-4 shadow-card", className)}>
      <div className="flex items-center gap-2.5">
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", ICON_TONES[tone])}>
          {icon}
        </span>
        <span className="text-[13px] font-medium text-muted">{label}</span>
      </div>
      <p className="nums mt-3 text-[28px] font-bold leading-none text-ink">{value}</p>
      {sub ? <p className="mt-2 text-[12px] text-faint">{sub}</p> : null}
    </div>
  );
}
