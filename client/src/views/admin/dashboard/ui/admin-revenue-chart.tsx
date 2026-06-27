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
import { formatMoney, formatShortDate } from "@/features/admin/lib/format";
import type { AdminDashboard } from "@/features/admin/model/types";

type Props = {
  data: AdminDashboard["revenueByDay"];
};

export const AdminRevenueChart = ({ data }: Props) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="adminRevenue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            formatter={(value, name) => {
              const numericValue = Number(value ?? 0);
              return [
                name === "revenue" ? formatMoney(numericValue) : numericValue,
                name === "revenue" ? "Выручка" : "Заказы",
              ];
            }}
            labelFormatter={(label) => formatShortDate(String(label))}
            contentStyle={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#adminRevenue)"
            isAnimationActive={data.length < 40}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
