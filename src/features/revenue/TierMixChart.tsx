"use client";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { AppText } from "@/shared/ui/AppText";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Numeric } from "@/components/numeric/Numeric";
import { formatNumber, formatPercent } from "@/shared/lib/format";
import { type Tier } from "@/shared/api/types";

const LABELS: Record<Tier, string> = { free: "Free", pro: "Pro", business: "Business" };
const COLORS: Record<Tier, string> = {
  free: "var(--text-secondary)",
  pro: "var(--action-primary)",
  business: "var(--success)",
};

export function TierMixChart({
  data,
}: {
  data: { tier: Tier; users: number; revenue: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.users, 0) || 1;
  const rows = [...data].sort((a, b) => b.users - a.users);

  // Build SVG arc paths for a donut chart.
  const size = 180;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = rows.map((d) => {
    const fraction = d.users / total;
    const dasharray = `${fraction * circumference} ${circumference}`;
    const dashoffset = -cumulative * circumference;
    cumulative += fraction;
    return {
      tier: d.tier,
      label: LABELS[d.tier],
      color: COLORS[d.tier],
      users: d.users,
      share: fraction,
      dasharray,
      dashoffset,
    };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex grow items-center gap-2">
          <AppText role="card">Tier mix</AppText>
          <InfoTooltip label="About tier mix">
            How paying and free users are distributed across your
            subscription tiers. The table also shows the revenue each
            tier contributes. A healthy mix has most paying users in
            mid-to-top tiers rather than Free.
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="flex flex-col items-center gap-5 px-6 py-5 sm:flex-row">
          <div
            className="relative shrink-0"
            style={{ width: size, height: size }}
            role="img"
            aria-label="Tier distribution donut chart"
          >
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90"
            >
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="var(--bg-subtle)"
                strokeWidth={stroke}
              />
              {segments.map((s) => (
                <circle
                  key={s.tier}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={s.dasharray}
                  strokeDashoffset={s.dashoffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
                Total
              </span>
              <span className="text-lg font-semibold text-[var(--text-primary)] _num">
                <Numeric value={formatNumber(total)} />
              </span>
            </div>
          </div>
          <ul className="flex w-full flex-col gap-2" aria-label="Tier breakdown">
            {segments.map((s) => (
              <li key={s.tier} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-[var(--text-primary)]">{s.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--text-secondary)] _num">
                    <Numeric value={formatNumber(s.users)} />
                  </span>
                  <span className="w-12 text-end text-[var(--text-primary)] _num">
                    <Numeric value={formatPercent(s.share)} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}

export const TIER_LABELS = LABELS;
