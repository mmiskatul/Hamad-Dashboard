"use client";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { AppText } from "@/shared/ui/AppText";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Numeric } from "@/components/numeric/Numeric";
import { formatCurrency } from "@/shared/lib/format";

export function MrrChart({ data }: { data: { month: string; mrr: number }[] }) {
  const max = Math.max(...data.map((d) => d.mrr), 1);
  return (
    <Card>
      <CardHeader>
        <div className="flex grow items-center gap-2">
          <AppText role="card">MRR (Monthly Recurring Revenue)</AppText>
          <InfoTooltip label="MRR (Monthly Recurring Revenue)">
            The total subscription revenue, normalised to a monthly run rate,
            billed on the first of each period. Excludes one-off credits and
            refunds. A rising line means net new or upgraded subscriptions;
            a flat or falling line means churn is out-pacing upgrades.
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="px-6 py-5">
          <ul className="space-y-2" aria-label="Monthly recurring revenue">
            {data.map((d) => {
              const width = (d.mrr / max) * 100;
              return (
                <li key={d.month} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-xs text-[var(--text-secondary)]">
                    {d.month}
                  </span>
                  <div
                    className="relative h-2 grow overflow-hidden rounded-full bg-[var(--bg-subtle)]"
                    role="presentation"
                  >
                    <div
                      className="absolute inset-y-0 start-0 rounded-full"
                      style={{
                        width: `${width}%`,
                        background: "var(--action-primary)",
                      }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-end text-xs text-[var(--text-primary)] _num">
                    <Numeric value={formatCurrency(d.mrr)} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
