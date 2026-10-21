"use client";

import { useSession } from "@/lib/session";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Dev-only preview control. Lets us (and sir) flip between Admin and Fleet
 * operator to see how the console changes per role. In production this whole
 * widget is replaced by the real signed-in session.
 */
export function RoleSwitcher() {
  const { user, setRole } = useSession();
  const options: { role: Role; label: string }[] = [
    { role: "admin", label: "Admin" },
    { role: "fleet_operator", label: "Fleet operator" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-canvas p-1">
      <span className="px-2 text-[11px] font-medium text-faint">Preview as</span>
      {options.map((o) => (
        <button
          key={o.role}
          onClick={() => setRole(o.role)}
          className={cn(
            "rounded-full px-3 py-1 text-[12px] font-semibold transition-colors",
            user.role === o.role ? "bg-brand-600 text-white" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
