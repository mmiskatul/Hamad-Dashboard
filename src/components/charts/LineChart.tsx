"use client";
import { ChartWrapper } from "./ChartWrapper";
import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type LineSeries = { name: string; key: string; color: string };

export function LineChart({
  label,
  data,
  series,
  xKey,
  height = 220,
  className,
}: {
  label: string;
  data: Record<string, number | string>[];
  series: LineSeries[];
  xKey: string;
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
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <th scope="row">{String(row[xKey])}</th>
                {series.map((s) => (
                  <td key={s.key}>{String(row[s.key] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <RLineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
