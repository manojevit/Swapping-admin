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
  { id: "s1", code: "EVIT-HYT-001", name: "EVIT-HYT-001", orgId: "evit", location: "New Delhi, Delhi", baysFull: 6, baysTotal: 9, readyPacks: 2, status: "online", lastSeen: iso(2), faults: 0 },
  { id: "s2", code: "EVIT-HYT-002", name: "EVIT-HYT-002", orgId: "evit", location: "New Delhi, Delhi", baysFull: 0, baysTotal: 9, readyPacks: 0, status: "offline", lastSeen: iso(60 * 24 * 28), faults: 3 },
  { id: "s3", code: "EVX-PKL-0001", name: "EVX-PANCHKULA", orgId: "evipilot", location: "Panchkula, Haryana", baysFull: 6, baysTotal: 9, readyPacks: 2, status: "online", lastSeen: iso(3), faults: 0 },
  { id: "s4", code: "EVX-ZRK-0002", name: "EVX-PEER MUCHALLA", orgId: "evipilot", location: "Zirakpur, Punjab", baysFull: 2, baysTotal: 9, readyPacks: 7, status: "maintenance", lastSeen: iso(10), faults: 1 },
  { id: "s5", code: "EVIT-HYT-003", name: "EVIT-HYT-003", orgId: "evit", location: "New Delhi, Delhi", baysFull: 0, baysTotal: 9, readyPacks: 0, status: "offline", lastSeen: iso(60), faults: 2 },
  { id: "s6", code: "EVIT-HYT-004", name: "EVIT-HYT-004", orgId: "evit", location: "New Delhi, Delhi", baysFull: 6, baysTotal: 9, readyPacks: 2, status: "online", lastSeen: iso(180), faults: 0 },
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

// ---- Per-screen KPI headers (echo the approved mockups) ----
export const STATION_KPIS = { total: 6, online: 2, offline: 3, maintenance: 1, totalSlots: 54, readySlots: 2 };
export const BATTERY_KPIS = { total: 160, healthy: 144, low: 8, fault: 6 };
export const RIDER_KPIS = { total: 32, active: 30, suspended: 2, swapsToday: 18 };
export const VEHICLE_KPIS = { total: 36, onRoad: 28, offRoad: 6, unassigned: 2 };
export const SWAP_KPIS = { completed: 167, batteryReturned: 4, failed: 21, running: 0 };
export const ALERT_KPIS = { critical: 2, warning: 95, info: 3, open: 12, resolved: 88 };

export const RIDERS: Rider[] = [
  { id: "RIDER00001", name: "Rahul", phone: "+91 98*** 1856", orgId: "evipilot", city: null, vehicle: "HR 68 A 1201", batteryId: "INCBZG5145M0685", batterySoc: 92, status: "active", swaps: 24, swapAllowed: true },
  { id: "RIDER00002", name: "Manoj", phone: "+91 78*** 1845", orgId: "evipilot", city: "Delhi", vehicle: "HR 68 A 1202", batteryId: "INCBZG5145M0686", batterySoc: 68, status: "active", swaps: 16, swapAllowed: true },
  { id: "RIDER00003", name: "RAHUL Soni", phone: "+91 88*** 4150", orgId: "evipilot", city: null, vehicle: "CH 01 BX 4410", batteryId: "INCBZG5145M0687", batterySoc: 76, status: "active", swaps: 12, swapAllowed: true },
  { id: "RIDER00004", name: "Riplav", phone: "+91 70*** 6390", orgId: "evipilot", city: null, vehicle: "CH 01 BX 4411", batteryId: "INCBZG5145M0688", batterySoc: 84, status: "suspended", swaps: 4, swapAllowed: false },
  { id: "RIDER00005", name: "Alice Tester", phone: "+91 91*** 6313", orgId: "evipilot", city: null, vehicle: null, batteryId: null, batterySoc: null, status: "active", swaps: 8, swapAllowed: true },
  { id: "RIDER00006", name: "Sameer Khan", phone: "+91 92*** 0286", orgId: "evipilot", city: null, vehicle: null, batteryId: null, batterySoc: null, status: "active", swaps: 5, swapAllowed: true },
  { id: "RIDER00007", name: "Neha Sharma", phone: "+91 93*** 4512", orgId: "evipilot", city: "Noida", vehicle: "DL 10 AB 7780", batteryId: "INCBZG5145M0690", batterySoc: 61, status: "active", swaps: 19, swapAllowed: true },
  { id: "RIDER00008", name: "Amit Verma", phone: "+91 93*** 2097", orgId: "evipilot", city: "Gurugram", vehicle: "HR 26 CD 3321", batteryId: "INCBZG5145M0691", batterySoc: 73, status: "active", swaps: 7, swapAllowed: true },
  { id: "RIDER00009", name: "Shahbaz Idrishi", phone: "+91 83*** 0191", orgId: "evipilot", city: null, vehicle: null, batteryId: null, batterySoc: null, status: "suspended", swaps: 3, swapAllowed: false },
  { id: "RIDER00010", name: "Saurabh", phone: "+91 97*** 7480", orgId: "evit", city: "New Delhi", vehicle: null, batteryId: null, batterySoc: null, status: "active", swaps: 2, swapAllowed: true },
];

export const VEHICLES: Vehicle[] = [
  { id: "EVX-004", code: "SESEAG03260115", chassis: "SESEAG03260115", model: "SHEMA LS", orgId: "evipilot", rider: "Nazim Khan", riderPhone: "+91 89585 69562", batteryId: null, charge: null, location: "New Delhi, Delhi", status: "on_road", swaps: 78 },
  { id: "EVX-008", code: "SESEAG03260035", chassis: "SESEAG03260035", model: "SHEMA LS", orgId: "evipilot", rider: "Kapil", riderPhone: "+91 76588 16935", batteryId: "INCBZG5145M0218", charge: 100, location: "Gurugram, Haryana", status: "on_road", swaps: 79 },
  { id: "EVX-009", code: "SESEAG03260149", chassis: "SESEAG03260149", model: "SHEMA", orgId: "evipilot", rider: null, riderPhone: null, batteryId: null, charge: null, location: "Noida, Uttar Pradesh", status: "on_road", swaps: 44 },
  { id: "EVX-01", code: "SESEAG03260079", chassis: "SESEAG03260079", model: "SHEMA EAGLE", orgId: "evipilot", rider: "Sonu", riderPhone: "+91 83033 90692", batteryId: "INCBZG5145M0625", charge: 100, location: "Faridabad, Haryana", status: "on_road", swaps: 82 },
  { id: "EVX-05", code: "SESEAG03260105", chassis: "SESEAG03260105", model: "SHEMA LS", orgId: "evipilot", rider: "Aadesh Kumar", riderPhone: "+91 84006 83076", batteryId: "INCBZG5145M0157", charge: 100, location: "New Delhi, Delhi", status: "on_road", swaps: 99 },
  { id: "EVX-06", code: "SESEAG03260077", chassis: "SESEAG03260077", model: "SHEMA LS", orgId: "evipilot", rider: "Mansaram", riderPhone: "+91 91156 04782", batteryId: "INCBZE5145M0501", charge: 100, location: "Panchkula, Haryana", status: "on_road", swaps: 31 },
  { id: "EVX-07", code: "SESEAG03260167", chassis: "SESEAG03260167", model: "SHEMA LS", orgId: "evipilot", rider: "Sanchit", riderPhone: "+91 95596 67672", batteryId: null, charge: 0, location: "Zirakpur, Punjab", status: "off_road", swaps: 54 },
  { id: "EVX-08", code: "SESEAG03260145", chassis: "SESEAG03260145", model: "SHEMA LS", orgId: "evipilot", rider: "Harish", riderPhone: "+91 80526 85353", batteryId: null, charge: null, location: "Noida, Uttar Pradesh", status: "off_road", swaps: 5 },
];

export const BATTERIES: Battery[] = [
  { id: "INCBZG5145M0164", brand: "Superpower", orgId: "evipilot", whereKind: "vehicle", whereLabel: "EVX-VEH-9001", cameFrom: "Vehicle HR 68 A 1201", movedBy: "Nazim Khan", soc: 100, soh: 98, health: "healthy", updatedAt: iso(120) },
  { id: "INCBZE5145M0501", brand: "Superpower", orgId: "evipilot", whereKind: "station", whereLabel: "EVX-PKL-0001 · Bay 5", cameFrom: "Station EVX-PKL-0001", movedBy: "System", soc: 77, soh: 95, health: "healthy", updatedAt: iso(300) },
  { id: "INCBZE5145M0576", brand: "Superpower", orgId: "evipilot", whereKind: "vehicle", whereLabel: "EVX-VEH-9002", cameFrom: "Vehicle HR 68 A 1202", movedBy: "Kapil", soc: 42, soh: 88, health: "healthy", updatedAt: iso(60 * 24) },
  { id: "INCBZG5145M0155", brand: "Superpower", orgId: "evipilot", whereKind: "station", whereLabel: "EVX-HYT-002 · Bay 1", cameFrom: "Station EVX-HYT-002", movedBy: "System", soc: 18, soh: 82, health: "low", updatedAt: iso(60 * 24) },
  { id: "INCBZG5145M0157", brand: "Superpower", orgId: "evipilot", whereKind: "vehicle", whereLabel: "EVX-VEH-9003", cameFrom: "Vehicle CH 01 BX 4410", movedBy: "Rahul", soc: 100, soh: 97, health: "healthy", updatedAt: iso(60 * 24) },
  { id: "INCBZG5145M0159", brand: "Superpower", orgId: "evipilot", whereKind: "station", whereLabel: "EVX-GZB-001 · Bay 4", cameFrom: "Station EVX-GZB-001", movedBy: "System", soc: 8, soh: 76, health: "low", updatedAt: iso(60 * 48) },
  { id: "INCBZG5145M0182", brand: "Superpower", orgId: "evipilot", whereKind: "vehicle", whereLabel: "EVX-VEH-9004", cameFrom: "Vehicle DL 10 AB 7780", movedBy: "Sanchit", soc: 0, soh: 70, health: "fault", updatedAt: iso(60 * 72) },
  { id: "INCBZG5145M0195", brand: "Superpower", orgId: "evipilot", whereKind: "station", whereLabel: "EVX-NDL-001 · Bay 2", cameFrom: "Station EVX-NDL-001", movedBy: "System", soc: 65, soh: 90, health: "healthy", updatedAt: iso(60 * 50) },
  { id: "INCBZG5145M0218", brand: "Superpower", orgId: "evipilot", whereKind: "station", whereLabel: "EVX-ZRK-002 · Bay 1", cameFrom: "Station EVX-ZRK-002", movedBy: "System", soc: 23, soh: 85, health: "low", updatedAt: iso(60 * 60) },
];

export const SWAPS: Swap[] = [
  { id: "sw1", startedAt: iso(60), endedAt: iso(55), stationCode: "EVX-PKL-0001", riderName: "Sonu", riderPhone: "+91 83833 64692", orgId: "evipilot", bayIn: 5, bayOut: 7, gaveInBattery: "INCBZG5145M0625", gaveInSoc: 0, tookOutBattery: "INCBZG5145M0270", tookOutSoc: 100, outcome: "completed" },
  { id: "sw2", startedAt: iso(90), endedAt: iso(89), stationCode: "EVX-PKL-0001", riderName: "Budhi Lal", riderPhone: "+91 73967 16363", orgId: "evipilot", bayIn: 5, bayOut: 6, gaveInBattery: "INCBZG5145M0195", gaveInSoc: 15, tookOutBattery: "INCBZG5145M0493", tookOutSoc: 100, outcome: "battery_returned", note: "The cabinet did not open the dispense flap" },
  { id: "sw3", startedAt: iso(120), endedAt: iso(119), stationCode: "EVX-PKL-0001", riderName: "Amit Kumar", riderPhone: "+91 62812 21344", orgId: "evipilot", bayIn: 4, bayOut: 5, gaveInBattery: "INCBZG5145M0319", gaveInSoc: 18, tookOutBattery: "INCBZG5145M0882", tookOutSoc: 100, outcome: "completed" },
  { id: "sw4", startedAt: iso(150), endedAt: iso(149), stationCode: "EVX-PKL-0001", riderName: "Kapil", riderPhone: "+91 76058 16395", orgId: "evipilot", bayIn: 3, bayOut: 4, gaveInBattery: "INCBZG5145M0286", gaveInSoc: 1, tookOutBattery: "INCBZG5145M0218", tookOutSoc: 100, outcome: "completed" },
  { id: "sw5", startedAt: iso(180), endedAt: iso(179), stationCode: "EVX-PKL-0001", riderName: "Aadesh Kumar", riderPhone: "+91 84686 28792", orgId: "evipilot", bayIn: 2, bayOut: 3, gaveInBattery: "INCBZG5145M0801", gaveInSoc: 5, tookOutBattery: "INCBZG5145M0157", tookOutSoc: 100, outcome: "completed" },
  { id: "sw6", startedAt: iso(210), endedAt: iso(209), stationCode: "EVX-PKL-0001", riderName: "Saurabh", riderPhone: "+91 93124 41670", orgId: "evipilot", bayIn: 1, bayOut: 2, gaveInBattery: "INCBZG5145M0195", gaveInSoc: 0, tookOutBattery: "INCBZG5145M0297", tookOutSoc: 100, outcome: "completed" },
  { id: "sw7", startedAt: iso(900), endedAt: iso(899), stationCode: "EVX-PKL-0001", riderName: "Aryaw Yadav", riderPhone: "+91 99585 59716", orgId: "evipilot", bayIn: 2, bayOut: 1, gaveInBattery: "INCBZG5145M0297", gaveInSoc: 40, tookOutBattery: "INCBZG5145M0241", tookOutSoc: 100, outcome: "completed" },
  { id: "sw8", startedAt: iso(960), endedAt: iso(959), stationCode: "EVX-PKL-0001", riderName: "Budhi Lal", riderPhone: "+91 73967 16363", orgId: "evipilot", bayIn: 1, bayOut: 2, gaveInBattery: "INCBZG5145M0241", gaveInSoc: 26, tookOutBattery: "INCBZG5145M0195", tookOutSoc: 100, outcome: "completed" },
];

export const ALERTS: Alert[] = [
  { id: "al1", severity: "critical", title: "Station offline", detail: "Station is not responding", sourceLabel: "EVIT-HYT-002", orgId: "evipilot", raisedAt: iso(60 * 14), status: "open" },
  { id: "al2", severity: "critical", title: "Battery fault", detail: "Battery reported a fault condition", sourceLabel: "INCBZG5145M0195", orgId: "evipilot", raisedAt: iso(60 * 16), status: "open" },
  { id: "al3", severity: "warning", title: "Low battery charge", detail: "Battery charge below threshold (16%)", sourceLabel: "INCBZG5145M0218", orgId: "evipilot", raisedAt: iso(60 * 24), status: "acknowledged" },
  { id: "al4", severity: "warning", title: "No network heartbeat", detail: "Station heartbeat not received", sourceLabel: "EVIT-HYT-004", orgId: "evipilot", raisedAt: iso(60 * 28), status: "resolved" },
  { id: "al5", severity: "info", title: "Maintenance required", detail: "Scheduled maintenance due soon", sourceLabel: "EVX-ZRK-0002", orgId: "evipilot", raisedAt: iso(60 * 52), status: "resolved" },
];
