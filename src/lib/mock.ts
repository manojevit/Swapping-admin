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
  { id: "s1", code: "EVIT-HYT-001", name: "EVIT-HYT-001", orgId: "evit", location: "New Delhi, Delhi", baysFull: 6, baysTotal: 9, readyPacks: 2, status: "online", lastSeen: iso(2), faults: 0, lat: 28.6139, lng: 77.209 },
  { id: "s2", code: "EVIT-HYT-002", name: "EVIT-HYT-002", orgId: "evit", location: "New Delhi, Delhi", baysFull: 0, baysTotal: 9, readyPacks: 0, status: "offline", lastSeen: iso(60 * 24 * 28), faults: 3, lat: 28.5355, lng: 77.241 },
  { id: "s3", code: "EVX-PKL-0001", name: "EVX-PANCHKULA", orgId: "evipilot", location: "Panchkula, Haryana", baysFull: 6, baysTotal: 9, readyPacks: 2, status: "online", lastSeen: iso(3), faults: 0, lat: 30.6942, lng: 76.8606 },
  { id: "s4", code: "EVX-ZRK-0002", name: "EVX-PEER MUCHALLA", orgId: "evipilot", location: "Zirakpur, Punjab", baysFull: 2, baysTotal: 9, readyPacks: 7, status: "maintenance", lastSeen: iso(10), faults: 1, lat: 30.6425, lng: 76.8173 },
  { id: "s5", code: "EVIT-HYT-003", name: "EVIT-HYT-003", orgId: "evit", location: "Noida, Uttar Pradesh", baysFull: 0, baysTotal: 9, readyPacks: 0, status: "offline", lastSeen: iso(60), faults: 2, lat: 28.5355, lng: 77.391 },
  { id: "s6", code: "EVIT-HYT-004", name: "EVIT-HYT-004", orgId: "evit", location: "Gurugram, Haryana", baysFull: 6, baysTotal: 9, readyPacks: 2, status: "online", lastSeen: iso(180), faults: 0, lat: 28.4595, lng: 77.0266 },
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

// ---- Station detail (bays, commands, info) ----
const STATION_META: Record<string, { address: string; installedOn: string }> = {
  "EVX-PKL-0001": { address: "Ground Floor, DSS 323, Sector 20 Market, Near HP Petrol Pump, Sector 20, Panchkula 134117", installedOn: "15 Sep 2026, 10:20 am" },
};

function buildBays(station: Station): import("./types").Bay[] {
  const total = station.baysTotal;
  const charged = station.status === "offline" ? 0 : station.readyPacks;
  const occupied = station.status === "offline" ? 0 : station.baysFull;
  const charging = Math.max(0, occupied - charged);
  const faulted = station.faults;

  const sampleSerials = ["INCBZG5145M0155", "INCBZG5145V0801", "INCBZG5145M0206", "INCBZG5145M0159", "INCBZG5145M0625", "INCBZG5145M0195"];
  const bays: import("./types").Bay[] = [];
  for (let i = 1; i <= total; i++) {
    let state: import("./types").BayState;
    if (i <= charged) state = "charged";
    else if (i <= charged + charging) state = "charging";
    else if (i > total - faulted) state = "faulted";
    else state = "empty";

    const filled = state === "charged" || state === "charging";
    const sohs = [96, 88, 82, 97, 76, 91, 85, 79, 93];
    bays.push({
      index: i,
      state,
      soc: state === "charged" ? 100 : state === "charging" ? [21, 60, 76][i % 3] : null,
      serial: filled ? sampleSerials[(i - 1) % sampleSerials.length] : null,
      voltage: filled ? (state === "charged" ? 53.5 : 54.1) : null,
      current: filled ? (state === "charging" ? 15.6 : 0.0) : null,
      temp: filled ? (state === "charging" ? 38 : 40) : null,
      soh: filled ? sohs[(i - 1) % sohs.length] : state === "faulted" ? 64 : null,
      flap: "closed",
    });
  }
  return bays;
}

const SAMPLE_COMMANDS: import("./types").StationCommand[] = [
  { at: iso(60 * 3), bay: 1, what: "OPEN_FLAP · operator (admin tool)", delivered: true },
  { at: iso(60 * 4), bay: 7, what: "OPEN_FLAP · swap", delivered: true },
  { at: iso(60 * 4 + 1), bay: 5, what: "OPEN_FLAP · swap", delivered: true },
  { at: iso(60 * 4 + 2), bay: 5, what: "OPEN_FLAP · flap fell back to CLOSED", delivered: true },
  { at: iso(60 * 4 + 3), bay: 6, what: "OPEN_FLAP · operator (admin tool)", delivered: true },
];

export function getStationDetail(id: string): import("./types").StationDetail | null {
  const station = STATIONS.find((s) => s.id === id || s.code === id);
  if (!station) return null;
  const meta = STATION_META[station.code] ?? {
    address: `${station.location} — ${station.name}`,
    installedOn: "15 Sep 2026, 10:20 am",
  };
  const lastSwapRow = SWAPS.find((sw) => sw.stationCode === station.code) ?? null;
  return {
    ...station,
    address: meta.address,
    locationId: station.code,
    installedOn: meta.installedOn,
    firmware: "v2.4.1",
    firmwareLatest: "v2.5.0",
    bays: buildBays(station),
    commands: station.status === "offline" ? [] : SAMPLE_COMMANDS,
    lastSwap: lastSwapRow
      ? { id: lastSwapRow.id, outcome: "SWAP_COMPLETED", bayIn: lastSwapRow.bayIn, bayOut: lastSwapRow.bayOut, startedAt: lastSwapRow.startedAt }
      : null,
  };
}

// ---- Per-screen KPI headers (echo the approved mockups) ----
export const STATION_KPIS = { total: 6, online: 2, offline: 3, maintenance: 1, totalSlots: 54, readySlots: 2 };
export const BATTERY_KPIS = { total: 160, healthy: 144, low: 8, fault: 6 };
export const RIDER_KPIS = { total: 32, active: 30, suspended: 2, swapsToday: 18 };
export const VEHICLE_KPIS = { total: 36, onRoad: 28, offRoad: 6, unassigned: 2 };
export const SWAP_KPIS = { completed: 167, batteryReturned: 4, failed: 21, running: 0 };
export const ALERT_KPIS = { critical: 2, warning: 95, info: 3, open: 12, resolved: 88 };

export const RIDERS: Rider[] = [
  { id: "RIDER00001", name: "Rahul", phone: "+91 98341 71856", orgId: "evipilot", city: null, vehicle: "HR 68 A 1201", batteryId: "INCBZG5145M0685", batterySoc: 92, status: "active", swaps: 24, swapAllowed: true },
  { id: "RIDER00002", name: "Manoj", phone: "+91 78265 41845", orgId: "evipilot", city: "Delhi", vehicle: "HR 68 A 1202", batteryId: "INCBZG5145M0686", batterySoc: 68, status: "active", swaps: 16, swapAllowed: true },
  { id: "RIDER00003", name: "RAHUL Soni", phone: "+91 88720 94150", orgId: "evipilot", city: null, vehicle: "CH 01 BX 4410", batteryId: "INCBZG5145M0687", batterySoc: 76, status: "active", swaps: 12, swapAllowed: true },
  { id: "RIDER00004", name: "Riplav", phone: "+91 70114 86390", orgId: "evipilot", city: null, vehicle: "CH 01 BX 4411", batteryId: "INCBZG5145M0688", batterySoc: 84, status: "suspended", swaps: 4, swapAllowed: false },
  { id: "RIDER00005", name: "Alice Tester", phone: "+91 91903 56313", orgId: "evipilot", city: null, vehicle: null, batteryId: null, batterySoc: null, status: "active", swaps: 8, swapAllowed: true },
  { id: "RIDER00006", name: "Sameer Khan", phone: "+91 92056 70286", orgId: "evipilot", city: null, vehicle: null, batteryId: null, batterySoc: null, status: "active", swaps: 5, swapAllowed: true },
  { id: "RIDER00007", name: "Neha Sharma", phone: "+91 93681 24512", orgId: "evipilot", city: "Noida", vehicle: "DL 10 AB 7780", batteryId: "INCBZG5145M0690", batterySoc: 61, status: "active", swaps: 19, swapAllowed: true },
  { id: "RIDER00008", name: "Amit Verma", phone: "+91 93420 72097", orgId: "evipilot", city: "Gurugram", vehicle: "HR 26 CD 3321", batteryId: "INCBZG5145M0691", batterySoc: 73, status: "active", swaps: 7, swapAllowed: true },
  { id: "RIDER00009", name: "Shahbaz Idrishi", phone: "+91 83991 40191", orgId: "evipilot", city: null, vehicle: null, batteryId: null, batterySoc: null, status: "suspended", swaps: 3, swapAllowed: false },
  { id: "RIDER00010", name: "Saurabh", phone: "+91 97800 57480", orgId: "evit", city: "New Delhi", vehicle: null, batteryId: null, batterySoc: null, status: "active", swaps: 2, swapAllowed: true },
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

// ---- Support tickets (raised by riders in the app, surfaced here) ----
export const TICKETS: import("./types").Ticket[] = [
  { id: "TKT-2048", rider: "Rahul", phone: "+91 98341 71856", subject: "Swap failed but wallet was charged", message: "I tapped to swap at EVX-PKL-0001 bay 5, the flap opened but no pack came out and ₹49 was deducted. Please refund.", category: "Swap failed", orgId: "evipilot", raisedAt: iso(60 * 1.5), status: "open" },
  { id: "TKT-2047", rider: "Neha Sharma", phone: "+91 93681 24512", subject: "App crashes on the map screen", message: "Every time I open the station map the app freezes and closes. Using an Android phone.", category: "App bug", orgId: "evipilot", raisedAt: iso(60 * 4), status: "open" },
  { id: "TKT-2046", rider: "Amit Verma", phone: "+91 93420 72097", subject: "Battery drains too fast", message: "The last two packs I got from Gurugram drop to 20% within 30 km. Can you check their health?", category: "Battery issue", orgId: "evipilot", raisedAt: iso(60 * 9), status: "in_progress" },
  { id: "TKT-2045", rider: "Sanchit", phone: "+91 95596 67672", subject: "Station always offline", message: "EVX-ZRK-0002 near my home has been offline for 3 days. When will it be fixed?", category: "Station issue", orgId: "evipilot", raisedAt: iso(60 * 20), status: "open" },
  { id: "TKT-2044", rider: "Manoj", phone: "+91 78265 41845", subject: "Wrong plan charged", message: "I'm on Standard Monthly but I was charged the Unlimited price this month.", category: "Billing", orgId: "evipilot", raisedAt: iso(60 * 30), status: "in_progress" },
  { id: "TKT-2043", rider: "Budhi Lal", phone: "+91 73967 16363", subject: "Cannot update phone number", message: "The app shows an error when I try to change my registered mobile number.", category: "App bug", orgId: "evipilot", raisedAt: iso(60 * 44), status: "resolved" },
  { id: "TKT-2042", rider: "Aadesh Kumar", phone: "+91 84686 28792", subject: "QR not scanning at station", message: "The sticker QR at Faridabad won't scan, had to enter the code manually twice.", category: "Station issue", orgId: "evipilot", raisedAt: iso(60 * 70), status: "resolved" },
  { id: "TKT-2041", rider: "Saurabh", phone: "+91 97800 57480", subject: "Refund not received", message: "A failed swap refund from last week still hasn't reached my wallet.", category: "Billing", orgId: "evit", raisedAt: iso(60 * 96), status: "open" },
];

// ---- Analytics ----
export const ANALYTICS_KPIS = {
  totalSwaps: { value: "1,284", delta: 8.4, up: true },
  avgDwell: { value: "4m 32s", delta: -12, up: false },
  batteryTurn: { value: "3.8×", delta: 16, up: true },
  retention: { value: "76%", delta: 6, up: true },
};
export const ANALYTICS_SUBSTATS = {
  grossRevenue: "₹3,21,000",
  uptime: "98.6%",
  avgPerDay: 43,
  stationsReporting: "18/21",
};
export const SWAPS_PER_DAY = Array.from({ length: 30 }, (_, i) => {
  const base = 30 + 28 * Math.sin(i / 3) + (i > 18 ? 20 : 0);
  return {
    day: new Date(2026, 5, 22 + i).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    completed: Math.max(12, Math.round(base + (i % 4) * 3)),
    returned: Math.round(4 + 6 * Math.abs(Math.sin(i / 2))),
    failed: Math.round(2 + 3 * Math.abs(Math.cos(i / 2))),
  };
});
export const STATION_PERFORMANCE = [
  { name: "Connaught Place", location: "New Delhi", swaps: 342, dwell: "3m 12s", completion: 98, status: "online" as const },
  { name: "Saket", location: "New Delhi", swaps: 280, dwell: "4m 18s", completion: 96, status: "online" as const },
  { name: "Rajouri Garden", location: "New Delhi", swaps: 226, dwell: "4m 52s", completion: 94, status: "online" as const },
  { name: "Dwarka Sector 21", location: "New Delhi", swaps: 180, dwell: "5m 21s", completion: 92, status: "maintenance" as const },
  { name: "Noida Sector 62", location: "Noida", swaps: 156, dwell: "6m 08s", completion: 90, status: "online" as const },
];
export const BATTERY_HEALTH_TREND = Array.from({ length: 28 }, (_, i) => ({
  day: new Date(2026, 5, 22 + i).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
  healthy: 90 + Math.round(i * 2.2),
  low: 18 + (i % 5) * 2,
  fault: 6 + (i % 3) * 2,
}));
export const ANALYTICS_INSIGHTS = [
  { kind: "up" as const, title: "Peak activity hours", body: "Swaps are 42% higher during 5–7 PM compared to daily average. Consider adding staff and battery inventory during this period." },
  { kind: "warn" as const, title: "Higher failed swaps at Noida Sector 62", body: "Failed swap rate is 3.2% (2× higher than network average). Check battery health and station hardware." },
];

// ---- Plans ----
export const PLANS: import("./types").Plan[] = [
  { id: "p1", name: "Unlimited Monthly", price: 2499, period: "30 days", orgLabel: "Shared template", shared: true, includes: ["Unlimited swaps, every day", "Any EVCHARGEX station", "No per-swap charge", "Priority support"], subscribers: 24, status: "active", createdAt: "01 Oct 2026, 10:30 am" },
  { id: "p2", name: "Standard Monthly", price: 999, period: "30 days", orgLabel: "EVI Pilot Fleet", shared: false, includes: ["50 swaps per month", "Any EVCHARGEX station", "Standard support"], subscribers: 5, status: "active", createdAt: "15 Sep 2026, 02:14 pm" },
  { id: "p3", name: "Pay As You Go", price: 49, period: "Per swap", orgLabel: "Shared template", shared: true, includes: ["Pay per swap", "Any EVCHARGEX station", "No subscription required"], subscribers: 2, status: "active", createdAt: "10 Sep 2026, 11:21 am" },
];
export const PLAN_KPIS = { total: 3, active: 3, subscribers: 31, mrr: "₹78,549" };

// ---- Console logins ----
export const CONSOLE_LOGINS: import("./types").ConsoleLogin[] = [
  { id: "l1", email: "mohzzam@evitpl.com", role: "Administrator", orgLabel: "Every organisation", lastSignIn: "09 Oct 2026, 10:37 am", status: "active" },
  { id: "l2", email: "akm@evitpl.com", role: "Fleet operator", orgLabel: "EVI Pilot Fleet", lastSignIn: "03 Oct 2026, 10:56 am", status: "active" },
  { id: "l3", email: "ops@evitpl.com", role: "Fleet operator", orgLabel: "EVI Pilot Fleet", lastSignIn: "05 Oct 2026, 11:33 am", status: "active" },
];

// ---- Revenue ----
export const REVENUE_KPIS = { revenue: 124500, paidSwaps: 842, activeSubs: 31, outstanding: 4200 };

export const REVENUE_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: new Date(2026, 8, 22 + i).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
  amount: Math.round(2500 + 2200 * Math.abs(Math.sin(i / 3)) + (i > 18 ? 1500 : 0)),
}));

export const REVENUE_BY_PLAN = [
  { plan: "Unlimited Monthly", amount: 59976, color: "#1E63F0" },
  { plan: "Pay As You Go", amount: 41258, color: "#F59E0B" },
  { plan: "One-off swaps", amount: 18271, color: "#8B5CF6" },
  { plan: "Standard Monthly", amount: 4995, color: "#16A34A" },
];

export type TxnStatus = "paid" | "pending" | "refunded";
export const RECENT_TRANSACTIONS: { id: string; date: string; rider: string; description: string; amount: number; status: TxnStatus }[] = [
  { id: "TXN-10428", date: iso(60 * 2), rider: "Rahul", description: "Unlimited Monthly · renewal", amount: 2499, status: "paid" },
  { id: "TXN-10427", date: iso(60 * 5), rider: "Neha Sharma", description: "Pay As You Go · swap", amount: 49, status: "paid" },
  { id: "TXN-10426", date: iso(60 * 9), rider: "Amit Verma", description: "Wallet top-up", amount: 500, status: "paid" },
  { id: "TXN-10425", date: iso(60 * 26), rider: "Manoj", description: "Standard Monthly · renewal", amount: 999, status: "paid" },
  { id: "TXN-10424", date: iso(60 * 30), rider: "Sameer Khan", description: "Pay As You Go · swap", amount: 49, status: "pending" },
  { id: "TXN-10423", date: iso(60 * 44), rider: "RAHUL Soni", description: "Unlimited Monthly · renewal", amount: 2499, status: "paid" },
  { id: "TXN-10422", date: iso(60 * 52), rider: "Riplav", description: "Pay As You Go · swap", amount: 49, status: "refunded" },
  { id: "TXN-10421", date: iso(60 * 70), rider: "Saurabh", description: "Wallet top-up", amount: 300, status: "paid" },
  { id: "TXN-10420", date: iso(60 * 80), rider: "Shahbaz Idrishi", description: "Pay As You Go · swap", amount: 49, status: "paid" },
  { id: "TXN-10419", date: iso(60 * 96), rider: "Alice Tester", description: "Unlimited Monthly · renewal", amount: 2499, status: "paid" },
  { id: "TXN-10418", date: iso(60 * 108), rider: "Neha Sharma", description: "Pay As You Go · swap", amount: 49, status: "paid" },
  { id: "TXN-10417", date: iso(60 * 120), rider: "Rahul", description: "Wallet top-up", amount: 1000, status: "paid" },
  { id: "TXN-10416", date: iso(60 * 138), rider: "Amit Verma", description: "Pay As You Go · swap", amount: 49, status: "pending" },
  { id: "TXN-10415", date: iso(60 * 150), rider: "Manoj", description: "Pay As You Go · swap", amount: 49, status: "paid" },
  { id: "TXN-10414", date: iso(60 * 168), rider: "RAHUL Soni", description: "Wallet top-up", amount: 500, status: "paid" },
  { id: "TXN-10413", date: iso(60 * 180), rider: "Sameer Khan", description: "Standard Monthly · renewal", amount: 999, status: "paid" },
];

// ---- Organisation stats (for the Organisations table) ----
export const ORG_STATS: Record<string, { description: string; stations: number; riders: number; vehicles: number; batteries: number; createdAt: string }> = {
  evipilot: { description: "Pilot fleet for EVI operations", stations: 2, riders: 31, vehicles: 17, batteries: 18, createdAt: "06 Aug 2026, 10:30 am" },
  evit: { description: "EVIT organisation network", stations: 4, riders: 1, vehicles: 0, batteries: 0, createdAt: "08 Aug 2026, 11:45 am" },
};

// ---- Firmware (OTA images + per-station versions) ----
// "Board" = the controller inside a cabinet the image targets. The container's
// own header declares board/version/length/CRC; the server checks the upload
// against the declared board before accepting it.
export type FirmwareBoard = "station" | "slot" | "gateway" | "bootloader";

export const FIRMWARE_BOARDS: { value: FirmwareBoard; label: string }[] = [
  { value: "station", label: "Station controller" },
  { value: "slot", label: "Slot board" },
  { value: "gateway", label: "Gateway" },
  { value: "bootloader", label: "Bootloader" },
];

// Newest station-controller build that exists in this fleet. A station on an
// older station firmware is flagged "behind".
export const FIRMWARE_LATEST = "0.7.3";

export interface FirmwareImage {
  id: string;
  version: string;
  board: FirmwareBoard;
  bytes: number;
  crc: string; // CRC32 from the container header
  uploadedBy: string;
  uploadedAt: string; // ISO
  notes: string;
}

export const FIRMWARE_IMAGES: FirmwareImage[] = [
  { id: "fw_0073_station", version: "0.7.3", board: "station", bytes: 1_148_928, crc: "0x9A3F21C7", uploadedBy: "Mohzzam", uploadedAt: iso(60 * 20), notes: "Faster cold-start, flap retry on bay timeout" },
  { id: "fw_0072_station", version: "0.7.2", board: "station", bytes: 1_142_784, crc: "0x41BE07D2", uploadedBy: "Mohzzam", uploadedAt: iso(60 * 24 * 9), notes: "Heartbeat backoff fix" },
  { id: "fw_0040_slot", version: "0.4.0", board: "slot", bytes: 262_144, crc: "0x7C55E910", uploadedBy: "AKM", uploadedAt: iso(60 * 24 * 12), notes: "SoH read calibration" },
  { id: "fw_0017_gateway", version: "0.1.7", board: "gateway", bytes: 524_288, crc: "0x2D18BB4A", uploadedBy: "AKM", uploadedAt: iso(60 * 24 * 21), notes: "LTE reconnect window widened" },
  { id: "fw_0010_bootloader", version: "0.1.0", board: "bootloader", bytes: 65_536, crc: "0xE4490F38", uploadedBy: "Mohzzam", uploadedAt: iso(60 * 24 * 40), notes: "Signed-image enforcement" },
];

export type FirmwareJobStatus = "downloading" | "installing" | "done" | "failed" | "scheduled";

export interface FirmwareJob {
  id: string;
  stationCode: string;
  orgName: string;
  image: string; // "station 0.7.3"
  status: FirmwareJobStatus;
  progress: number; // 0-100
  startedAt: string; // ISO
  note: string;
}

export const FIRMWARE_JOBS: FirmwareJob[] = [
  { id: "job_5120", stationCode: "EVX-PKL-0001", orgName: "EVI Pilot Fleet", image: "station 0.7.3", status: "installing", progress: 82, startedAt: iso(14), note: "Waiting for bays to clear before reboot" },
  { id: "job_5119", stationCode: "EVIT-HYT-001", orgName: "EVIT ORG", image: "station 0.7.3", status: "downloading", progress: 46, startedAt: iso(22), note: "Transfer in progress" },
  { id: "job_5118", stationCode: "EVIT-HYT-004", orgName: "EVIT ORG", image: "gateway 0.1.7", status: "done", progress: 100, startedAt: iso(60 * 3), note: "Installed, verified on reboot" },
  { id: "job_5117", stationCode: "EVIT-HYT-002", orgName: "EVIT ORG", image: "station 0.7.3", status: "failed", progress: 0, startedAt: iso(60 * 5), note: "Station offline — no transfer started" },
  { id: "job_5116", stationCode: "EVX-ZRK-0002", orgName: "EVI Pilot Fleet", image: "slot 0.4.0", status: "scheduled", progress: 0, startedAt: iso(-60 * 6), note: "Install held until 02:00 IST" },
];

export interface FirmwareFleetRow {
  stationCode: string;
  stationName: string;
  orgName: string;
  stationFw: string | null; // null = never reported
  bootloader: string | null;
  gateway: string | null;
  slotVersions: string[]; // distinct slot-board versions seen in the cabinet
  lastSeen: string; // ISO
}

export const FIRMWARE_FLEET: FirmwareFleetRow[] = [
  { stationCode: "EVX-PKL-0001", stationName: "EVX-PANCHKULA", orgName: "EVI Pilot Fleet", stationFw: "0.7.3", bootloader: "0.1.0", gateway: "0.1.7", slotVersions: ["0.4.0"], lastSeen: iso(3) },
  { stationCode: "EVIT-HYT-001", stationName: "EVIT-HYT-001", orgName: "EVIT ORG", stationFw: "0.7.3", bootloader: "0.1.0", gateway: "0.1.7", slotVersions: ["0.4.0", "0.3.9"], lastSeen: iso(2) },
  { stationCode: "EVIT-HYT-004", stationName: "EVIT-HYT-004", orgName: "EVIT ORG", stationFw: "0.7.2", bootloader: "0.1.0", gateway: "0.1.7", slotVersions: ["0.4.0"], lastSeen: iso(180) },
  { stationCode: "EVX-ZRK-0002", stationName: "EVX-PEER MUCHALLA", orgName: "EVI Pilot Fleet", stationFw: "0.2.0", bootloader: "0.1.0", gateway: "0.1.2", slotVersions: ["0.4.0"], lastSeen: iso(10) },
  { stationCode: "EVIT-HYT-003", stationName: "EVIT-HYT-003", orgName: "EVIT ORG", stationFw: "0.2.0", bootloader: "0.1.0", gateway: "0.1.2", slotVersions: ["0.3.9"], lastSeen: iso(60) },
  { stationCode: "EVIT-HYT-002", stationName: "EVIT-HYT-002", orgName: "EVIT ORG", stationFw: null, bootloader: null, gateway: null, slotVersions: [], lastSeen: iso(60 * 24 * 28) },
];
