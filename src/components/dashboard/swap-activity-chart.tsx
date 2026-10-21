"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SWAP_ACTIVITY } from "@/lib/mock";

export function SwapActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={SWAP_ACTIVITY} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16A34A" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F6" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 11, fill: "#9AA4B2" }}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis tick={{ fontSize: 11, fill: "#9AA4B2" }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #E7EBF1",
            boxShadow: "0 8px 24px rgba(16,24,40,0.12)",
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="completed" name="Completed" stroke="#16A34A" strokeWidth={2.5} fill="url(#gCompleted)" />
        <Area type="monotone" dataKey="failed" name="Failed" stroke="#DC2626" strokeWidth={2} fill="url(#gFailed)" />
        <Area type="monotone" dataKey="returned" name="Battery returned" stroke="#F59E0B" strokeWidth={2} fill="none" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
