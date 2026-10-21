// A hand-built illustration of an EVCHARGEX battery-swap cabinet: nine bays in
// charged / charging / empty states with live status LEDs. Rendered as inline
// SVG in brand colors — no photos or screenshots.

type BayState = "ready" | "charging" | "empty";
const BAYS: { level: number; state: BayState }[] = [
  { level: 100, state: "ready" }, { level: 100, state: "ready" }, { level: 72, state: "charging" },
  { level: 46, state: "charging" }, { level: 100, state: "ready" }, { level: 0, state: "empty" },
  { level: 100, state: "ready" }, { level: 21, state: "charging" }, { level: 0, state: "empty" },
];

const FILL = { ready: "#16A34A", charging: "#F59E0B", empty: "transparent" };
const LED = { ready: "#22C55E", charging: "#FBBF24", empty: "#334155" };

export function SwapStationArt({ className }: { className?: string }) {
  const originX = 60;
  const originY = 80;
  const cellW = 58;
  const cellH = 56;
  const colGap = 16.5;
  const rowGap = 10.5;

  return (
    <svg viewBox="0 0 360 348" className={className} role="img" aria-label="EVCHARGEX battery-swap station">
      <defs>
        <radialGradient id="ssGlow" cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#1E63F0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1E63F0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ssBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16233F" />
          <stop offset="100%" stopColor="#0E1A31" />
        </linearGradient>
        <filter id="ssLed" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ambient glow */}
      <rect x="0" y="0" width="360" height="348" fill="url(#ssGlow)" />
      {/* floor shadow */}
      <ellipse cx="180" cy="322" rx="140" ry="14" fill="#000" opacity="0.28" />

      {/* cabinet */}
      <rect x="38" y="22" width="284" height="290" rx="22" fill="url(#ssBody)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      <rect x="48" y="32" width="264" height="270" rx="16" fill="#0B1426" stroke="rgba(255,255,255,0.05)" />

      {/* header readout */}
      <g>
        <circle cx="66" cy="52" r="4" fill="#22C55E" filter="url(#ssLed)" />
        <text x="78" y="56" fill="rgba(255,255,255,0.85)" fontSize="11" fontWeight="700" letterSpacing="0.5" fontFamily="Inter, sans-serif">EVX-PKL-0001</text>
        <text x="296" y="56" fill="rgba(255,255,255,0.45)" fontSize="10" fontWeight="600" textAnchor="end" fontFamily="Inter, sans-serif">ONLINE</text>
        <line x1="48" y1="68" x2="312" y2="68" stroke="rgba(255,255,255,0.07)" />
      </g>

      {/* bays */}
      {BAYS.map((bay, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = originX + colGap * (col + 1) + cellW * col;
        const y = originY + rowGap * (row + 1) + cellH * row;
        const innerH = 40;
        const fillH = (innerH * bay.level) / 100;
        return (
          <g key={i}>
            <rect x={x} y={y} width={cellW} height={cellH} rx="10" fill="#0C1426" stroke="rgba(255,255,255,0.08)" />
            {/* battery cap */}
            <rect x={x + cellW / 2 - 8} y={y + 7} width="16" height="4" rx="2" fill="rgba(255,255,255,0.14)" />
            {/* charge fill */}
            {bay.level > 0 && (
              <rect
                x={x + 8}
                y={y + 14 + (innerH - fillH)}
                width={cellW - 16}
                height={fillH}
                rx="5"
                fill={FILL[bay.state]}
                opacity="0.85"
              />
            )}
            {/* status LED */}
            <circle cx={x + cellW - 12} cy={y + cellH - 11} r="3.4" fill={LED[bay.state]} filter="url(#ssLed)">
              {bay.state === "charging" && (
                <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
              )}
            </circle>
          </g>
        );
      })}

      {/* feet */}
      <rect x="70" y="312" width="26" height="10" rx="3" fill="#0B1426" />
      <rect x="264" y="312" width="26" height="10" rx="3" fill="#0B1426" />
    </svg>
  );
}
