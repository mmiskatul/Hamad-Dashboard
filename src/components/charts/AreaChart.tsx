"use client";
import { ChartWrapper } from "./ChartWrapper";
import {
  Area,
  AreaChart as RAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AreaChart({
  label,
  data,
  dataKey,
  xKey,
  color = "var(--action-primary)",
  height = 220,
  className,
}: {
  label: string;
  data: Record<string, number | string>[];
  dataKey: string;
  xKey: string;
  color?: string;
  height?: number;
  className?: string;
}) {
  return (
    <ChartWrapper
      label={label}
      className={className}
      style={{ height }}
      dataTable={
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">{xKey}</th>
              <th scope="col">{dataKey}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <th scope="row">{String(row[xKey])}</th>
                <td>{String(row[dataKey] ?? "")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <RAreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`area-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 6" />
          <XAxis
            dataKey={xKey}
            stroke="var(--text-secondary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-surface-inverse)",
              color: "var(--text-inverse)",
              borderRadius: 8,
              fontSize: 12,
              border: "none",
            }}
          />
          <Area
            dataKey={dataKey}
            type="monotone"
            stroke={color}
            fill={`url(#area-${dataKey})`}
            strokeWidth={2}
          />
        </RAreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
