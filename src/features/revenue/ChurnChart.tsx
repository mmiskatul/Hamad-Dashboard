"use client";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Numeric } from "@/components/numeric/Numeric";
import { AppText } from "@/shared/ui/AppText";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function ChurnChart({ data }: { data: { month: string; churn: number; newMrr?: number }[] }) {
  const rows = data.map((d) => ({
    month: d.month,
    churn: Math.round(d.churn * 10000) / 100,
  }));
  const max = Math.max(...rows.map((d) => d.churn), 1);
  return (
    <Card>
      <CardHeader>
        <div className="flex grow items-center gap-2">
          <AppText role="card">Churn (% of paying customers)</AppText>
          <InfoTooltip label="About churn">
            The percentage of paying customers who cancelled or failed to renew
            in that month. Lower is better. Anything under
            {" "}<Numeric value="3%" /> monthly is healthy for SaaS; sustained
            readings above <Numeric value="5%" /> usually mean onboarding,
            pricing, or product-fit friction.
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="px-6 py-5">
          <ul className="space-y-2" aria-label="Monthly churn rate">
            {rows.map((d) => {
              const width = (d.churn / max) * 100;
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
                        background: "var(--danger)",
                      }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-end text-xs text-[var(--text-primary)] _num">
                    <Numeric value={`${d.churn.toFixed(2)}%`} />
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
