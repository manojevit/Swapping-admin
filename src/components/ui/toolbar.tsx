"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";

/** Search box + arbitrary filter controls on the left, actions on the right. */
export function Toolbar({
  placeholder,
  filters,
  actions,
  search,
  onSearch,
}: {
  placeholder: string;
  filters?: ReactNode;
  actions?: ReactNode;
  search?: string;
  onSearch?: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={search}
          onChange={onSearch ? (e) => onSearch(e.target.value) : undefined}
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
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      {label ? <span className="hidden sm:inline">{label}</span> : null}
      <select
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="h-10 rounded-xl border border-line bg-surface px-3 text-[13px] text-ink focus:border-brand-300 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
