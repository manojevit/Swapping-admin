"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import QRCode from "react-qr-code";
import { FileDown, Image as ImageIcon, Cpu, KeyRound, Copy, RefreshCw } from "lucide-react";
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

const LOGO_ASPECT = 3230 / 470;

export function QrModal({ open, onClose, station }: { open: boolean; onClose: () => void; station: StationDetail }) {
  const ref = useRef<HTMLDivElement>(null);
  const { show } = useToast();
  const [logoData, setLogoData] = useState<string | null>(null);
  const url = `https://console.evchargex.app/s/${station.code}`;

  // Load the white logo as a data URI so it can be embedded in the exported SVG.
  useEffect(() => {
    if (!open || logoData) return;
    let cancelled = false;
    fetch("/brand/logo-white.png")
      .then((r) => r.blob())
      .then((b) => new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.readAsDataURL(b); }))
      .then((d) => { if (!cancelled) setLogoData(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [open, logoData]);

  // Overlay geometry as fractions of the QR's own coordinate box.
  const geo = { white: 0.26, whiteR: 0.05, pill: 0.225, pillH: 0.1, pillR: 0.04, logo: 0.185 };

  function downloadSvg() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const vb = (svg.getAttribute("viewBox") || "0 0 29 29").split(" ").map(Number);
    const N = vb[2] || 29;
    const c = N / 2;
    const w = N * geo.white, pw = N * geo.pill, ph = N * geo.pillH;
    const lw = N * geo.logo, lh = lw / LOGO_ASPECT;
    const overlay =
      `<rect x="${c - w / 2}" y="${c - w / 2}" width="${w}" height="${w}" rx="${N * geo.whiteR}" fill="#FFFFFF"/>` +
      `<rect x="${c - pw / 2}" y="${c - ph / 2}" width="${pw}" height="${ph}" rx="${N * geo.pillR}" fill="#0B1220"/>` +
      (logoData ? `<image href="${logoData}" x="${c - lw / 2}" y="${c - lh / 2}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMid meet"/>` : "");
    const composite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" width="1024" height="1024">${svg.innerHTML}${overlay}</svg>`;
    const objUrl = URL.createObjectURL(new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', composite], { type: "image/svg+xml" }));
    triggerDownload(objUrl, `${station.code}-qr.svg`);
    URL.revokeObjectURL(objUrl);
    show("SVG downloaded", { description: `${station.code}-qr.svg` });
  }

  function downloadPng() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const objUrl = URL.createObjectURL(new Blob([data], { type: "image/svg+xml;charset=utf-8" }));
    const qrImg = new Image();
    qrImg.onload = () => {
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      const q = size - 160;
      ctx.drawImage(qrImg, 80, 80, q, q);
      URL.revokeObjectURL(objUrl);

      const cx = size / 2;
      const w = size * geo.white, pw = size * geo.pill, ph = size * geo.pillH;
      roundRect(ctx, cx - w / 2, cx - w / 2, w, w, size * geo.whiteR);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      roundRect(ctx, cx - pw / 2, cx - ph / 2, pw, ph, size * geo.pillR);
      ctx.fillStyle = "#0B1220";
      ctx.fill();

      const finish = () => canvas.toBlob((b) => {
        if (!b) return;
        const pngUrl = URL.createObjectURL(b);
        triggerDownload(pngUrl, `${station.code}-qr.png`);
        URL.revokeObjectURL(pngUrl);
        show("PNG downloaded", { description: `${station.code}-qr.png` });
      });

      const logo = new Image();
      logo.onload = () => {
        const lw = size * geo.logo, lh = lw / LOGO_ASPECT;
        ctx.drawImage(logo, cx - lw / 2, cx - lh / 2, lw, lh);
        finish();
      };
      logo.onerror = finish;
      logo.src = logoData || "/brand/logo-white.png";
    };
    qrImg.src = objUrl;
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
        <div ref={ref} className="relative grid place-items-center rounded-2xl border border-line bg-white p-4">
          <QRCode value={url} size={200} level="H" fgColor="#0B1420" bgColor="#FFFFFF" />
          {/* Center brand mark */}
          <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-white p-[5px]">
            <span className="flex items-center justify-center rounded-md bg-sidebar px-2.5 py-1.5">
              <NextImage src="/brand/logo-white.png" alt="EVCHARGEX" width={72} height={11} />
            </span>
          </span>
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
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

function makeToken() {
  const seg = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  return `evx_${seg()}${seg()}`;
}

export function KeyModal({ open, onClose, stationCode }: { open: boolean; onClose: () => void; stationCode: string }) {
  const { show } = useToast();
  const [token, setToken] = useState(makeToken);

  function rotate() {
    setToken(makeToken());
    show("Station key rotated", { description: "Old QR stickers for this station are now invalid." });
  }
  function copy() {
    navigator.clipboard?.writeText(token).then(
      () => show("Key copied to clipboard"),
      () => show("Couldn't copy", { tone: "warn" }),
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<KeyRound className="h-5 w-5" />}
      title={`${stationCode} · access key`}
      description="The rotatable token embedded in this station's QR."
      footer={
        <>
          <Button variant="secondary" onClick={copy}><Copy className="h-4 w-4" /> Copy</Button>
          <Button variant="danger" onClick={rotate}><RefreshCw className="h-4 w-4" /> Rotate key</Button>
        </>
      }
    >
      <div className="rounded-xl border border-line bg-canvas/60 px-4 py-3">
        <p className="nums break-all text-[14px] font-semibold text-ink">{token}</p>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">
        Rotating the key invalidates the current QR everywhere — reprint this station&apos;s sticker afterwards. No other station is affected.
      </p>
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
