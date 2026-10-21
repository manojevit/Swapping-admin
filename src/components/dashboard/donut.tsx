"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export function Donut({
  data,
  centerValue,
  centerLabel,
}: {
  data: DonutDatum[];
  centerValue: string | number;
  centerLabel: string;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="nums text-[26px] font-bold leading-none text-ink">{centerValue}</span>
          <span className="text-[12px] text-faint">{centerLabel}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="nums font-semibold text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
