"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

// A controlled modal (open/onClose owned by the caller). Mirrors the dialog
// chrome used across the console.
export function Modal({
  open,
  onClose,
  icon,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 text-left sm:items-center">
      <div className="animate-fade absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`animate-pop relative z-10 w-full overflow-hidden rounded-2xl bg-surface shadow-pop ring-1 ring-black/5 ${width}`}>
        <div className="flex items-start gap-3 px-6 pb-5 pt-6">
          {icon ? <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span> : null}
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-black/5 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-t border-line px-6 py-5">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas/50 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
