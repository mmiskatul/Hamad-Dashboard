"use client";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AppText } from "@/shared/ui/AppText";
import { Numeric } from "@/components/numeric/Numeric";
import { formatCurrency } from "@/shared/lib/format";

export function QuotaCard({
  requestsUsed,
  requestsLimit,
  costUsd,
}: {
  requestsUsed: number;
  requestsLimit: number;
  costUsd: number;
}) {
  const t = useTranslations("userDetail");
  const tq = useTranslations("quotaCard");
  const pct = Math.min(100, Math.round((requestsUsed / requestsLimit) * 100));
  const tone = pct < 60 ? "var(--success)" : pct < 90 ? "var(--warning)" : "var(--danger)";
  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <AppText role="card">{t("quota")}</AppText>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-[var(--text-secondary)]">{tq("requestsThisMonth")}</span>
          <Numeric value={`${requestsUsed}/${requestsLimit}`} className="text-lg font-medium" />
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]">
          <div className="h-full" style={{ width: `${pct}%`, background: tone }} />
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-[var(--text-secondary)]"><Numeric value="30" suffix="d" /> {tq("spend30d")}</span>
          <Numeric value={formatCurrency(costUsd)} className="font-medium" />
        </div>
      </CardBody>
    </Card>
  );
}