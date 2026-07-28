"use client";
import { ChartWrapper } from "@/components/charts/ChartWrapper";
import { Numeric } from "@/components/numeric/Numeric";
import { formatNumber } from "@/shared/lib/format";

export type FunnelRow = { stage: string; value: number };

/**
 * Horizontal funnel bars. Each stage is rendered as a centred bar whose width
 * is proportional to its share of the top-of-funnel value. The widest row
 * (Visitors) fills the chart; subsequent rows are nested inside the previous
 * one, the classic funnel look.
 *
 * Recharts is not used here so the chart has zero runtime cost in the test
 * environment and renders without a responsive container.
 */
export function FunnelChart({ rows }: { rows: FunnelRow[] }) {
  const top = rows[0]?.value ?? 1;
  const rendered = rows.map((r, i) => {
    const width = Math.max(8, Math.round((r.value / top) * 100));
    const prev = i > 0 ? rows[i - 1]!.value : r.value;
    const stepCr = i === 0 ? 100 : Math.round((r.value / prev) * 100);
    const overallCr = Math.round((r.value / top) * 100);
    const tier = Math.min(4, i); // 0..4 shading bands
    return { ...r, width, stepCr, overallCr, i, tier };
  });

  return (
    <ChartWrapper
      label="Conversion funnel"
      className="px-4 pt-3 pb-2"
      dataTable={
        <table>
          <caption>Conversion funnel</caption>
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col">Count</th>
              <th scope="col">Step CR</th>
              <th scope="col">Overall CR</th>
            </tr>
          </thead>
          <tbody>
            {rendered.map((r) => (
              <tr key={r.stage}>
                <th scope="row">{r.stage}</th>
                <td>{formatNumber(r.value)}</td>
                <td>{r.stepCr}%</td>
                <td>{r.overallCr}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ul className="flex flex-col gap-1.5" aria-label="Conversion funnel">
        {rendered.map((r) => (
          <li key={r.stage} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">{r.stage}</span>
              <span className="inline-flex items-center gap-3">
                <span className="_num">
                  <Numeric value={formatNumber(r.value)} />
                </span>
                <span className="text-[10px] uppercase tracking-wide">
                  <Numeric value={`${r.overallCr}%`} />
                </span>
              </span>
            </div>
            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]"
              role="presentation"
            >
              <div
                className="absolute inset-y-0 start-0 rounded-full"
                style={{
                  width: `${r.width}%`,
                  background: `var(--funnel-tier-${r.tier})`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </ChartWrapper>
  );
}
