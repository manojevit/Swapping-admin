import { cn } from "@/lib/utils";

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

const TONES: Record<Tone, string> = {
  success: "bg-success-soft text-success-ink",
  warn: "bg-warn-soft text-warn-ink",
  danger: "bg-danger-soft text-danger-ink",
  info: "bg-info-soft text-info-ink",
  neutral: "bg-black/5 text-muted",
};

export function StatusPill({
  children,
  tone = "neutral",
  dot = true,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  const dotColor: Record<Tone, string> = {
    success: "bg-success",
    warn: "bg-warn",
    danger: "bg-danger",
    info: "bg-info",
    neutral: "bg-faint",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium",
        TONES[tone],
        className,
      )}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[tone])} /> : null}
      {children}
    </span>
  );
}
