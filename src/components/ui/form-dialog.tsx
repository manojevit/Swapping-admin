"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
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
  title,
  description,
  submitLabel = "Save",
  children,
}: {
  trigger: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-surface shadow-pop">
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-[16px] font-bold text-ink">{title}</h2>
                {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-faint hover:bg-black/5 hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-5">{children}</div>
              <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className={cn(saved && "pointer-events-none")}>
                  {saved ? "Saved ✓" : submitLabel}
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
  "h-10 w-full rounded-xl border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-faint focus:border-brand-300 focus:bg-surface focus:outline-none";

export function Field({ label, placeholder, type = "text", defaultValue, required }: { label: string; placeholder?: string; type?: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-faint">{label}{required ? " *" : ""}</span>
      <input type={type} placeholder={placeholder} defaultValue={defaultValue} className={control} />
    </label>
  );
}

export function SelectField({ label, options, defaultValue }: { label: string; options: string[]; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-faint">{label}</span>
      <select defaultValue={defaultValue} className={control}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
