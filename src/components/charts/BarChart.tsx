"use client";
import { ChartWrapper } from "./ChartWrapper";
import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function BarChart({
  label,
  data,
  dataKey,
  xKey,
  color = "var(--action-primary)",
  height = 240,
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
        <RBarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
            cursor={{ fill: "var(--bg-subtle)" }}
            contentStyle={{
              background: "var(--bg-surface-inverse)",
              color: "var(--text-inverse)",
              borderRadius: 8,
              fontSize: 12,
              border: "none",
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </RBarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
