"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { navForRole } from "@/lib/nav";
import { useSession } from "@/lib/session";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useSession();
  const groups = navForRole(user.role);
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {open ? <div className="fixed inset-0 z-30 bg-ink/50 backdrop-blur-sm lg:hidden" onClick={onClose} /> : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[244px] flex-col bg-sidebar text-white transition-transform duration-200 lg:z-30 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
      {/* Brand */}
      <div className="flex items-start justify-between px-5 pb-4 pt-6">
        <div>
          <Logo tone="light" width={150} />
          <p className="mt-2 text-[10px] font-semibold tracking-[0.22em] text-sidebar-muted">CONSOLE</p>
        </div>
        <button onClick={onClose} className="-mr-1 grid h-8 w-8 place-items-center rounded-lg text-sidebar-muted hover:bg-sidebar-hover hover:text-white lg:hidden" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="scroll-slim flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.heading} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                        active
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Account */}
      <div className="border-t border-sidebar-line p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-[13px] font-bold">
            {initial}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold">{user.name}</p>
            <p className="truncate text-[11px] text-sidebar-muted">
              {user.role === "admin" ? "Administrator" : "Fleet operator"}
            </p>
          </div>
          <Link
            href="/login"
            title="Sign out"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
      </aside>
    </>
  );
}
