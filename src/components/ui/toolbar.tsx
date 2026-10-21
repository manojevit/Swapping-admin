"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";

/** Search box + arbitrary filter controls on the left, actions on the right. */
export function Toolbar({
  placeholder,
  filters,
  actions,
}: {
  placeholder: string;
  filters?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-[13px] placeholder:text-faint focus:border-brand-300 focus:bg-surface focus:outline-none"
        />
      </div>
      {filters}
      {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** A labelled <select> matching the console's control style. */
export function FilterSelect({
  label,
  options,
}: {
  label?: string;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      {label ? <span className="hidden sm:inline">{label}</span> : null}
      <select className="h-10 rounded-xl border border-line bg-surface px-3 text-[13px] text-ink focus:border-brand-300 focus:outline-none">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
