"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { Station, StationStatus } from "@/lib/types";

const PIN_COLOR: Record<StationStatus, string> = {
  online: "#16A34A",
  offline: "#DC2626",
  maintenance: "#F59E0B",
  unknown: "#64748B",
};

function pin(status: StationStatus) {
  const color = PIN_COLOR[status];
  return L.divIcon({
    className: "evx-pin",
    html: `<span style="
      display:block;width:18px;height:18px;border-radius:9999px;
      background:${color};border:3px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Keeps the map framed on whatever stations are currently shown.
function FitBounds({ stations }: { stations: Station[] }) {
  const map = useMap();
  useEffect(() => {
    if (stations.length === 0) return;
    const bounds = L.latLngBounds(stations.map((s) => [s.lat, s.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  }, [stations, map]);
  return null;
}

export default function NetworkMap({
  stations,
  onSelect,
}: {
  stations: Station[];
  onSelect?: (s: Station) => void;
}) {
  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={9}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
      className="z-0 rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds stations={stations} />
      {stations.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={pin(s.status)}
          eventHandlers={{ click: () => onSelect?.(s) }}
        >
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong>{s.code}</strong>
              <br />
              {s.location}
              <br />
              {s.baysFull}/{s.baysTotal} bays · {s.status}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
