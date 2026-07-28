"use client";
import { ChartWrapper } from "./ChartWrapper";
import {
  Cell,
  Pie,
  PieChart as RPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DEFAULT_COLORS = [
  "var(--model-gpt)",
  "var(--model-claude)",
  "var(--model-gemini)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
];

export function PieChart({
  label,
  data,
  dataKey,
  nameKey,
  height = 220,
  colors = DEFAULT_COLORS,
  className,
}: {
  label: string;
  data: Record<string, number | string>[];
  dataKey: string;
  nameKey: string;
  height?: number;
  colors?: string[];
  className?: string;
}) {
  const total = data.reduce(
    (sum, row) => sum + Number(row[dataKey] ?? 0),
    0,
  );
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
              <th scope="col">{nameKey}</th>
              <th scope="col">{dataKey}</th>
              <th scope="col">percent</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const value = Number(row[dataKey] ?? 0);
              const pct = total > 0 ? (value / total) * 100 : 0;
              return (
                <tr key={i}>
                  <th scope="row">{String(row[nameKey])}</th>
                  <td>{String(row[dataKey] ?? "")}</td>
                  <td>{pct.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <RPieChart>
          <Tooltip
            contentStyle={{
              background: "var(--bg-surface-inverse)",
              color: "var(--text-inverse)",
              borderRadius: 8,
              fontSize: 12,
              border: "none",
            }}
            formatter={(value: number | string, name: string) => {
              const num = Number(value);
              const pct = total > 0 ? (num / total) * 100 : 0;
              return [`${value} (${pct.toFixed(1)}%)`, name];
            }}
          />
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="75%"
            paddingAngle={2}
            label={({ percent, name }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
            }
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={colors[i % colors.length]}
                stroke="var(--bg-surface)"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </RPieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
