"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { FileDown, Image as ImageIcon, Cpu } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Bay, StationDetail } from "@/lib/types";

function triggerDownload(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function QrModal({ open, onClose, station }: { open: boolean; onClose: () => void; station: StationDetail }) {
  const ref = useRef<HTMLDivElement>(null);
  const { show } = useToast();
  const url = `https://console.evchargex.app/s/${station.code}`;

  function downloadSvg() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', data], { type: "image/svg+xml" });
    const objUrl = URL.createObjectURL(blob);
    triggerDownload(objUrl, `${station.code}-qr.svg`);
    URL.revokeObjectURL(objUrl);
    show("SVG downloaded", { description: `${station.code}-qr.svg` });
  }

  function downloadPng() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const objUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 96, 96, size - 192, size - 192);
      URL.revokeObjectURL(objUrl);
      canvas.toBlob((b) => {
        if (!b) return;
        const pngUrl = URL.createObjectURL(b);
        triggerDownload(pngUrl, `${station.code}-qr.png`);
        URL.revokeObjectURL(pngUrl);
        show("PNG downloaded", { description: `${station.code}-qr.png` });
      });
    };
    img.src = objUrl;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Station QR"
      description="Riders scan this to start a swap here."
      footer={
        <>
          <Button variant="secondary" onClick={downloadSvg}><FileDown className="h-4 w-4" /> SVG</Button>
          <Button variant="primary" onClick={downloadPng}><ImageIcon className="h-4 w-4" /> PNG, 1024px</Button>
        </>
      }
    >
      <div className="flex flex-col items-center">
        <div ref={ref} className="rounded-2xl border border-line bg-white p-4">
          <QRCode value={url} size={184} fgColor="#0B1420" bgColor="#FFFFFF" />
        </div>
        <p className="nums mt-4 text-[14px] font-semibold text-ink">{station.code}</p>
        <p className="nums mt-1 break-all text-center text-[12px] text-faint">{url}</p>
        <p className="mt-3 text-center text-[12px] leading-relaxed text-muted">
          The code carries this station&apos;s own rotatable token, so a photographed sticker can be revoked without reprinting the rest of the network.
        </p>
      </div>
    </Modal>
  );
}

export function BmsModal({ open, onClose, bay, stationCode }: { open: boolean; onClose: () => void; bay: Bay | null; stationCode: string }) {
  if (!bay) return null;
  const filled = bay.serial != null && bay.soc != null;
  const soh = bay.soh ?? 0;
  const cycles = Math.round((100 - soh) * 17 + 40);
  const baseCell = (bay.voltage ?? 53.5) / 14;
  const cells = Array.from({ length: 14 }, (_, i) => +(baseCell + Math.sin(i * 1.3) * 0.04 + (i === 4 ? -0.08 : 0)).toFixed(2));
  const minCell = Math.min(...cells);
  const maxCell = Math.max(...cells);
  const imbalance = +((maxCell - minCell) * 1000).toFixed(0); // mV

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Cpu className="h-5 w-5" />}
      title={`Bay ${String(bay.index).padStart(2, "0")} · BMS`}
      description={`${stationCode} · ${bay.serial ?? "no pack"}`}
    >
      {!filled ? (
        <p className="py-6 text-center text-[14px] text-muted">This bay is empty — there is no pack to report on.</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="State of charge" value={`${bay.soc}%`} />
            <Metric label="State of health" value={`${soh}%`} />
            <Metric label="Charge cycles" value={String(cycles)} />
            <Metric label="Pack voltage" value={`${bay.voltage}V`} />
            <Metric label="Current" value={`${bay.current}A`} />
            <Metric label="Temperature" value={`${bay.temp}°C`} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Cell voltages</p>
              <p className="text-[12px] text-muted">Imbalance <span className="nums font-semibold text-ink">{imbalance} mV</span></p>
            </div>
            <div className="flex items-end gap-1.5">
              {cells.map((v, i) => {
                const pct = ((v - 3.4) / (4.2 - 3.4)) * 100;
                const low = v === minCell;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-20 w-full items-end rounded-md bg-black/5">
                      <div className={cn("w-full rounded-md", low ? "bg-warn" : "bg-success")} style={{ height: `${Math.max(8, pct)}%` }} />
                    </div>
                    <span className="nums text-[9px] text-faint">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-canvas/60 px-4 py-3 text-[13px]">
            <span className="text-muted">Pack status</span>
            <span className="font-semibold text-success-ink">{bay.state === "charging" ? "Charging — healthy" : "Ready — healthy"}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="text-[11px] font-medium text-faint">{label}</p>
      <p className="nums mt-1 text-[18px] font-bold text-ink">{value}</p>
    </div>
  );
}
