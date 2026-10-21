"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "@/lib/nav";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useSession();
  const groups = navForRole(user.role);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[244px] flex-col bg-sidebar text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[11px] font-black tracking-tight text-sidebar">
          EVX
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-bold">EVCHARGEX</p>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-sidebar-muted">
            CONSOLE
          </p>
        </div>
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

      {/* Footer identity */}
      <div className="border-t border-sidebar-line px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-[11px] font-bold">
            EVX
          </span>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold">EVCHARGEX</p>
            <p className="text-[11px] text-sidebar-muted">
              {user.role === "admin" ? "Administrator" : "Fleet operator"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
