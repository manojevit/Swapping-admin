"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { useSession } from "@/lib/session";
import { RoleSwitcher } from "./role-switcher";

export function Topbar() {
  const { user } = useSession();
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center gap-4 border-b border-line bg-surface/80 px-6 backdrop-blur">
      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="text"
          placeholder="Search stations, riders, vehicles, batteries…"
          className="h-10 w-full rounded-xl border border-line bg-canvas pl-10 pr-12 text-[14px] text-ink placeholder:text-faint focus:border-brand-300 focus:bg-surface focus:outline-none"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] font-medium text-faint">
          ⌘K
        </kbd>
      </div>

      {/* Right-aligned cluster */}
      <div className="ml-auto flex items-center gap-3">
        <RoleSwitcher />

        <span className="h-6 w-px bg-line" />

        {/* Notifications */}
        <button className="relative grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-black/5 hover:text-ink">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            12
          </span>
        </button>

        {/* User */}
        <button className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 hover:bg-black/5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-[13px] font-bold text-white">
            {initial}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-semibold text-ink">{user.name}</span>
            <span className="block text-[11px] text-muted">
              {user.role === "admin" ? "Super admin" : "Fleet operator"}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-faint" />
        </button>
      </div>
    </header>
  );
}
