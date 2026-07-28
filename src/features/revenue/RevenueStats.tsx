"use client";
import { Card, CardBody } from "@/components/ui/card";
import { AppText } from "@/shared/ui/AppText";
import { Numeric } from "@/components/numeric/Numeric";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { useTranslations } from "next-intl";

export function RevenueStats({
  mrr,
  arr,
  arpu,
  churn,
}: {
  mrr: number;
  arr: number;
  arpu: number;
  churn: number;
}) {
  const t = useTranslations("revenue.stats");
  const items: { label: string; value: string; help: React.ReactNode }[] = [
    {
      label: t("mrr"),
      value: formatCurrency(mrr),
      help: (
        <>
          <strong>MRR (Monthly Recurring Revenue):</strong> the total
          subscription revenue normalised to a monthly run rate.
        </>
      ),
    },
    {
      label: t("arr"),
      value: formatCurrency(arr),
      help: (
        <>
          <strong>ARR (Annual Recurring Revenue):</strong> MRR ×
          {" "}<Numeric value="12" />. The forward-looking yearly
          subscription revenue.
        </>
      ),
    },
    {
      label: t("arpu"),
      value: formatCurrency(arpu),
      help: (
        <>
          <strong>ARPU (Average Revenue Per User):</strong> total revenue
          divided by the number of paying users in the period.
        </>
      ),
    },
    {
      label: t("churn"),
      value: formatPercent(churn),
      help: (
        <>
          <strong>Churn:</strong> percentage of paying customers who cancelled
          or failed to renew in the last <Numeric value="30" /> days.
        </>
      ),
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((s) => (
        <Card key={s.label}>
          <CardBody className="space-y-2">
            <div className="flex items-center gap-2">
              <AppText role="label" className="text-[var(--text-secondary)]">
                {s.label}
              </AppText>
              <InfoTooltip label={s.label}>{s.help}</InfoTooltip>
            </div>
            <Numeric value={s.value} className="text-2xl font-medium" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}