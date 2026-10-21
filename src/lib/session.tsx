"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role } from "./types";
import { ORGS } from "./mock";

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
  /** null = all organisations (admin). Otherwise the operator's own org id. */
  orgId: string | null;
}

interface SessionValue {
  user: SessionUser;
  /** Dev-only helper so we can preview each role without a real login. */
  setRole: (role: Role) => void;
  can: (perm: Permission) => boolean;
  orgName: string;
}

// Minimal permission set — only what the console actually gates on today.
export type Permission =
  | "manage_stations"
  | "manage_batteries"
  | "manage_riders"
  | "manage_vehicles"
  | "manage_alerts"
  | "run_station_controls"
  | "manage_organisations"
  | "manage_plans"
  | "manage_console_logins"
  | "view_all_orgs";

const ADMIN_PERMS: Permission[] = [
  "manage_stations",
  "manage_batteries",
  "manage_riders",
  "manage_vehicles",
  "manage_alerts",
  "run_station_controls",
  "manage_organisations",
  "manage_plans",
  "manage_console_logins",
  "view_all_orgs",
];

// Fleet operator: day-to-day ops for their own org. No org/plan/login admin.
const FLEET_PERMS: Permission[] = [
  "manage_stations",
  "manage_batteries",
  "manage_riders",
  "manage_vehicles",
  "manage_alerts",
  "run_station_controls",
];

const PERMS: Record<Role, Permission[]> = {
  admin: ADMIN_PERMS,
  fleet_operator: FLEET_PERMS,
};

const ADMIN_USER: SessionUser = {
  name: "Mohzzam",
  email: "mohzzam@evitpl.com",
  role: "admin",
  orgId: null,
};

const FLEET_USER: SessionUser = {
  name: "Ops (EVI Pilot)",
  email: "ops@evitpl.com",
  role: "fleet_operator",
  orgId: "evipilot",
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser>(ADMIN_USER);

  const value = useMemo<SessionValue>(() => {
    const perms = PERMS[user.role];
    return {
      user,
      setRole: (role) => setUser(role === "admin" ? ADMIN_USER : FLEET_USER),
      can: (perm) => perms.includes(perm),
      orgName:
        user.orgId === null
          ? "All organisations"
          : ORGS.find((o) => o.id === user.orgId)?.name ?? "—",
    };
  }, [user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
