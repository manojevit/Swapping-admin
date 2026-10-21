import type { Role } from "./types";
import {
  LayoutDashboard,
  Map,
  Radio,
  Bell,
  BatteryCharging,
  Users,
  Bike,
  ArrowLeftRight,
  BarChart3,
  Wallet,
  Building2,
  ScrollText,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles allowed to SEE this item. Omitted = everyone. */
  roles?: Role[];
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

// The ADMIN group is admin-only. Everything else is shared, but the data
// inside is scoped to the fleet operator's own org (handled in the mock layer).
export const NAV: NavGroup[] = [
  {
    heading: "Monitor",
    items: [
      { label: "Overview", href: "/overview", icon: LayoutDashboard },
      { label: "Map", href: "/map", icon: Map },
      { label: "Stations", href: "/stations", icon: Radio },
      { label: "Alerts", href: "/alerts", icon: Bell },
    ],
  },
  {
    heading: "Fleet",
    items: [
      { label: "Batteries", href: "/batteries", icon: BatteryCharging },
      { label: "Riders", href: "/riders", icon: Users },
      { label: "Vehicles", href: "/vehicles", icon: Bike },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Swap Report", href: "/swaps", icon: ArrowLeftRight },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Revenue", href: "/revenue", icon: Wallet },
    ],
  },
  {
    heading: "Admin",
    items: [
      { label: "Organisations", href: "/organisations", icon: Building2, roles: ["admin"] },
      { label: "Plans", href: "/plans", icon: ScrollText, roles: ["admin"] },
      { label: "Console logins", href: "/console-logins", icon: KeyRound, roles: ["admin"] },
    ],
  },
];

export function navForRole(role: Role): NavGroup[] {
  return NAV.map((group) => ({
    ...group,
    items: group.items.filter((i) => !i.roles || i.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
