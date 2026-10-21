// Domain types for the EVCHARGEX console.
// These mirror the entities used by the rider app so both share one vocabulary.
// The mock layer returns these shapes; a real API should return the same.

export type Role = "admin" | "fleet_operator";

export type StationStatus = "online" | "offline" | "maintenance" | "unknown";
export type BatteryHealth = "healthy" | "low" | "fault" | "unknown";
export type SwapOutcome = "completed" | "battery_returned" | "failed" | "running";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved";
export type RiderStatus = "active" | "suspended";
export type VehicleStatus = "on_road" | "off_road";

export interface Org {
  id: string;
  name: string;
  code: string;
  city: string;
}

export interface Station {
  id: string;
  code: string; // e.g. EVX-PKL-0001
  name: string; // e.g. EVX-PANCHKULA
  orgId: string;
  location: string; // "New Delhi, Delhi"
  baysFull: number;
  baysTotal: number;
  readyPacks: number; // charged packs ready to hand out
  status: StationStatus;
  lastSeen: string; // ISO
  faults: number;
}

export interface Battery {
  id: string; // serial, e.g. INCBZG5145M0164
  brand: string;
  orgId: string;
  whereKind: "station" | "vehicle";
  whereLabel: string;
  cameFrom: string;
  movedBy: string;
  soc: number; // state of charge %
  soh: number; // state of health %
  health: BatteryHealth;
  updatedAt: string;
}

export interface Rider {
  id: string; // RIDER00001
  name: string;
  phone: string;
  orgId: string;
  city: string | null;
  vehicle: string | null;
  batteryId: string | null;
  batterySoc: number | null;
  status: RiderStatus;
  swaps: number;
  swapAllowed: boolean;
}

export interface Vehicle {
  id: string; // EVX-004
  code: string; // SESEAG03260115
  chassis: string;
  model: string;
  orgId: string;
  rider: string | null;
  riderPhone: string | null;
  batteryId: string | null;
  charge: number | null;
  location: string;
  status: VehicleStatus;
  swaps: number;
}

export interface Swap {
  id: string;
  startedAt: string;
  endedAt: string;
  stationCode: string;
  riderName: string;
  riderPhone: string;
  orgId: string;
  bayIn: number;
  bayOut: number;
  gaveInBattery: string;
  gaveInSoc: number;
  tookOutBattery: string;
  tookOutSoc: number;
  outcome: SwapOutcome;
  note?: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  sourceLabel: string;
  orgId: string;
  raisedAt: string;
  status: AlertStatus;
}

export interface ActivityItem {
  id: string;
  kind: "swap_completed" | "battery_returned" | "station_offline" | "rider_registered" | "swap_failed";
  title: string;
  subtitle: string;
  at: string;
}
