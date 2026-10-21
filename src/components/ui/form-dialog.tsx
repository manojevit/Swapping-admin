"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

/**
 * A self-contained create/edit dialog: it renders its own trigger button,
 * owns open state, closes on Esc / backdrop, and fakes a submit (frontend
 * only). Pass form fields as children using <Field> / <SelectField>.
 */
export function FormDialog({
  trigger,
  triggerVariant = "primary",
  triggerSize = "lg",
  icon,
  title,
  description,
  submitLabel = "Save",
  children,
}: {
  trigger: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  icon?: ReactNode;
  title: string;
  description?: string;
  submitLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 850);
  }

  return (
    <>
      <Button variant={triggerVariant} size={triggerSize} onClick={() => setOpen(true)}>
        {trigger}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 text-left sm:items-center">
          <div className="animate-fade absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="animate-pop relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-pop ring-1 ring-black/5">
            {/* Header */}
            <div className="flex items-start gap-3 px-6 pb-5 pt-6">
              {icon ? (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-bold text-ink">{title}</h2>
                {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
              </div>
              <button type="button" onClick={() => setOpen(false)} className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-black/5 hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="scroll-slim max-h-[62vh] space-y-4 overflow-y-auto border-t border-line px-6 py-5">
                {children}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas/50 px-6 py-4">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className={cn(saved && "pointer-events-none bg-success hover:bg-success")}>
                  {saved ? <><Check className="h-4 w-4" /> Saved</> : submitLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

const control =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14px] text-ink placeholder:text-faint transition-colors hover:border-black/15 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15";

function Label({ children, required, optional }: { children: ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <span className="mb-1.5 flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium text-ink">
        {children}
        {required ? <span className="text-brand-600"> *</span> : null}
      </span>
      {optional ? <span className="text-[11px] font-normal text-faint">Optional</span> : null}
    </span>
  );
}

export function Field({ label, placeholder, type = "text", defaultValue, required, optional, hint }: { label: string; placeholder?: string; type?: string; defaultValue?: string; required?: boolean; optional?: boolean; hint?: string }) {
  return (
    <label className="block">
      <Label required={required} optional={optional}>{label}</Label>
      <input type={type} placeholder={placeholder} defaultValue={defaultValue} required={required} className={control} />
      {hint ? <span className="mt-1.5 block text-[12px] text-faint">{hint}</span> : null}
    </label>
  );
}

export function SelectField({ label, options, defaultValue, required, optional }: { label: string; options: string[]; defaultValue?: string; required?: boolean; optional?: boolean }) {
  return (
    <label className="block">
      <Label required={required} optional={optional}>{label}</Label>
      <span className="relative block">
        <select defaultValue={defaultValue} className={cn(control, "cursor-pointer appearance-none pr-10")}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
      </span>
    </label>
  );
}
