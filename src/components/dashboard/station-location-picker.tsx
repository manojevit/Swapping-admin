"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[12px] text-faint">Loading map…</div>,
});

const control =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14px] text-ink transition-colors hover:border-black/15 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10";

/** Latitude/longitude inputs paired with a live map (click or drag to set). */
export function StationLocationPicker({
  initialLat = 28.6139,
  initialLng = 77.209,
}: {
  initialLat?: number;
  initialLng?: number;
}) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);

  function setBoth(la: number, ln: number) {
    setLat(Number(la.toFixed(6)));
    setLng(Number(ln.toFixed(6)));
  }

  return (
    <div>
      <span className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">Location on map <span className="text-brand-600">*</span></span>
        <span className="inline-flex items-center gap-1 text-[12px] text-faint"><MapPin className="h-3.5 w-3.5" /> Click or drag the pin</span>
      </span>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-[12px] text-muted">Latitude</span>
          <input type="number" step="any" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className={control} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] text-muted">Longitude</span>
          <input type="number" step="any" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} className={control} />
        </label>
      </div>

      <div className="mt-3 h-[220px] overflow-hidden rounded-xl border border-line">
        <LocationPickerMap lat={Number.isFinite(lat) ? lat : initialLat} lng={Number.isFinite(lng) ? lng : initialLng} onChange={setBoth} />
      </div>
    </div>
  );
}
