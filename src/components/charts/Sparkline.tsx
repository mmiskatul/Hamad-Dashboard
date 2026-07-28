"use client";
import { ChartWrapper } from "./ChartWrapper";

export function Sparkline({
  label,
  values,
  color = "var(--action-primary)",
  width = 120,
  height = 32,
  className,
}: {
  label: string;
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const step = width / (values.length - 1 || 1);
  const range = max - min || 1;
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(height - ((v - min) / range) * (height - 4) - 2).toFixed(2)}`)
    .join(" ");
  return (
    <ChartWrapper
      label={label}
      className={className}
      dataTable={
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Index</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {values.map((v, i) => (
              <tr key={i}>
                <th scope="row">{i}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </ChartWrapper>
  );
}
