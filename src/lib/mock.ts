// Mock data layer. Shapes match src/lib/types.ts so a real API can drop in
// later with zero UI changes. Numbers echo the approved design mockups.

import type {
  ActivityItem,
  Alert,
  Battery,
  Org,
  Rider,
  Station,
  Swap,
  Vehicle,
} from "./types";

export const ORGS: Org[] = [
  { id: "evipilot", name: "EVI Pilot Fleet", code: "EVIPILOT", city: "Panchkula" },
  { id: "evit", name: "EVIT ORG", code: "EVIT", city: "New Delhi" },
];

function iso(minsAgo: number): string {
  return new Date(Date.now() - minsAgo * 60000).toISOString();
}

export const STATIONS: Station[] = [
  { id: "s1", code: "EVIT-HYT-001", name: "EVIT-HYT-001", orgId: "evit", location: "New Delhi, Delhi", baysFull: 6, baysTotal: 9, status: "online", lastSeen: iso(2), faults: 0 },
  { id: "s2", code: "EVIT-HYT-002", name: "EVIT-HYT-002", orgId: "evit", location: "New Delhi, Delhi", baysFull: 0, baysTotal: 9, status: "offline", lastSeen: iso(60 * 24 * 28), faults: 3 },
  { id: "s3", code: "EVX-PKL-0001", name: "EVX-PANCHKULA", orgId: "evipilot", location: "Panchkula, Haryana", baysFull: 6, baysTotal: 9, status: "online", lastSeen: iso(3), faults: 0 },
  { id: "s4", code: "EVX-ZRK-0002", name: "EVX-PEER MUCHALLA", orgId: "evipilot", location: "Zirakpur, Punjab", baysFull: 2, baysTotal: 9, status: "maintenance", lastSeen: iso(10), faults: 1 },
  { id: "s5", code: "EVIT-HYT-003", name: "EVIT-HYT-003", orgId: "evit", location: "New Delhi, Delhi", baysFull: 0, baysTotal: 9, status: "offline", lastSeen: iso(60), faults: 2 },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", kind: "swap_completed", title: "Swap completed", subtitle: "EVX-PKL-0001 · Kapil", at: iso(2) },
  { id: "a2", kind: "battery_returned", title: "Battery returned", subtitle: "INCBZG5145M0625", at: iso(8) },
  { id: "a3", kind: "station_offline", title: "Station offline", subtitle: "EVIT-HYT-002 · New Delhi", at: iso(32) },
  { id: "a4", kind: "rider_registered", title: "New rider registered", subtitle: "Saurabh", at: iso(60) },
  { id: "a5", kind: "swap_failed", title: "Swap failed", subtitle: "EVX-ZRK-0002 · Mohit", at: iso(120) },
];

// 24-hour swap activity curve (completed / returned / failed per hour).
export const SWAP_ACTIVITY = Array.from({ length: 24 }, (_, h) => {
  const peak = (x: number, c: number, w: number) => Math.exp(-((x - c) ** 2) / (2 * w * w));
  const completed = Math.round(6 + 32 * (peak(h, 12, 3.2) + 0.6 * peak(h, 19, 2.4)));
  const returned = Math.round(1 + 4 * peak(h, 13, 4));
  const failed = Math.round(1 + 10 * (0.5 * peak(h, 11, 3) + peak(h, 20, 2.2)));
  return { hour: `${String(h).padStart(2, "0")}:00`, completed, returned, failed };
});

export const KPIS = {
  stations: { total: 21, sub: "1 online" },
  riders: { total: 32, sub: "31 can swap" },
  vehicles: { total: 19, sub: "18 assigned" },
  batteries: { total: 160, sub: "144 healthy" },
  packsReady: { total: 86, sub: "6 bays occupied" },
  activeSwaps: { total: 3, sub: "in progress" },
  alerts: { total: 4, sub: "need attention" },
};

export const STATION_STATUS_BREAKDOWN = [
  { label: "Online", value: 4, color: "#16A34A" },
  { label: "Offline", value: 15, color: "#DC2626" },
  { label: "Maintenance", value: 1, color: "#F59E0B" },
  { label: "Unknown", value: 1, color: "#64748B" },
];

export const BATTERY_STATUS_BREAKDOWN = [
  { label: "Healthy", value: 144, color: "#16A34A" },
  { label: "Low (≤ 20%)", value: 8, color: "#F59E0B" },
  { label: "Fault", value: 6, color: "#DC2626" },
  { label: "Unknown", value: 2, color: "#64748B" },
];

export const SLOT_OCCUPANCY = { occupied: 854, empty: 106, total: 960 };

// Small samples for the Fleet/Operations screens (Phase 2+).
export const RIDERS: Rider[] = [
  { id: "RIDER00001", name: "Rahul", phone: "+91 98*** 1856", orgId: "evipilot", city: null, vehicle: "HR 68 A 1201", status: "active", swaps: 24, swapAllowed: true },
  { id: "RIDER00002", name: "Manoj", phone: "+91 78*** 1845", orgId: "evipilot", city: "Delhi", vehicle: "HR 68 A 1202", status: "active", swaps: 16, swapAllowed: true },
  { id: "RIDER00004", name: "Riplav", phone: "+91 70*** 6390", orgId: "evipilot", city: null, vehicle: "CH 01 BX 4411", status: "suspended", swaps: 4, swapAllowed: false },
];

export const VEHICLES: Vehicle[] = [
  { id: "EVX-004", chassis: "SESEAG03260115", model: "SHEMA LS", orgId: "evipilot", rider: "Nazim Khan", location: "New Delhi, Delhi", status: "on_road", swaps: 78 },
  { id: "EVX-009", chassis: "SESEAG03260149", model: "SHEMA", orgId: "evipilot", rider: null, location: "Noida, Uttar Pradesh", status: "on_road", swaps: 44 },
  { id: "EVX-07", chassis: "SESEAG03260167", model: "SHEMA LS", orgId: "evipilot", rider: "Sanchit", location: "Zirakpur, Punjab", status: "off_road", swaps: 54 },
];

export const BATTERIES: Battery[] = [
  { id: "INCBZG5145M0164", brand: "Superpower", orgId: "evipilot", whereKind: "vehicle", whereLabel: "EVX-VEH-9001", soc: 100, soh: 98, health: "healthy", updatedAt: iso(120) },
  { id: "INCBZE5145M0576", brand: "Superpower", orgId: "evipilot", whereKind: "vehicle", whereLabel: "EVX-VEH-9002", soc: 42, soh: 88, health: "healthy", updatedAt: iso(60 * 24) },
  { id: "INCBZG5145M0155", brand: "Superpower", orgId: "evipilot", whereKind: "station", whereLabel: "EVX-HYT-002 · Bay 1", soc: 18, soh: 82, health: "low", updatedAt: iso(60 * 24) },
];

export const SWAPS: Swap[] = [
  { id: "sw1", startedAt: iso(60), stationCode: "EVX-PKL-0001", riderName: "Sonu", orgId: "evipilot", bayIn: 5, bayOut: 7, outcome: "completed" },
  { id: "sw2", startedAt: iso(90), stationCode: "EVX-PKL-0001", riderName: "Budhi Lal", orgId: "evipilot", bayIn: 5, bayOut: 6, outcome: "battery_returned" },
  { id: "sw3", startedAt: iso(120), stationCode: "EVX-PKL-0001", riderName: "Amit Kumar", orgId: "evipilot", bayIn: 4, bayOut: 5, outcome: "completed" },
];

export const ALERTS: Alert[] = [
  { id: "al1", severity: "critical", title: "Station offline", detail: "Station is not responding", sourceLabel: "EVIT-HYT-002", orgId: "evipilot", raisedAt: iso(60 * 14), status: "open" },
  { id: "al2", severity: "critical", title: "Battery fault", detail: "Battery reported a fault condition", sourceLabel: "INCBZG5145M0195", orgId: "evipilot", raisedAt: iso(60 * 16), status: "open" },
  { id: "al3", severity: "warning", title: "Low battery charge", detail: "Battery charge below threshold (16%)", sourceLabel: "INCBZG5145M0218", orgId: "evipilot", raisedAt: iso(60 * 24), status: "acknowledged" },
];
