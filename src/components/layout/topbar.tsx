"use client";

import { Bell, ChevronDown, Search, Menu } from "lucide-react";
import { useSession } from "@/lib/session";
import { RoleSwitcher } from "./role-switcher";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { user } = useSession();
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-[64px] items-center gap-2 border-b border-line bg-surface/80 px-4 backdrop-blur sm:h-[68px] sm:gap-4 sm:px-6">
      {/* Mobile menu button */}
      <button onClick={onMenu} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-black/5 hover:text-ink lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative min-w-0 flex-1 sm:max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="text"
          placeholder="Search stations, riders, vehicles…"
          className="h-10 w-full rounded-xl border border-line bg-canvas pl-10 pr-4 text-[14px] text-ink placeholder:text-faint focus:border-brand-300 focus:bg-surface focus:outline-none sm:pr-12"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] font-medium text-faint sm:block">
          ⌘K
        </kbd>
      </div>

      {/* Right-aligned cluster */}
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden md:block"><RoleSwitcher /></div>
        <span className="hidden h-6 w-px bg-line md:block" />

        {/* Notifications */}
        <button className="relative grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-black/5 hover:text-ink">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            12
          </span>
        </button>

        {/* User */}
        <button className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 hover:bg-black/5 sm:pr-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-[13px] font-bold text-white">
            {initial}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-semibold text-ink">{user.name}</span>
            <span className="block text-[11px] text-muted">
              {user.role === "admin" ? "Super admin" : "Fleet operator"}
            </span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-faint sm:block" />
        </button>
      </div>
    </header>
  );
}
