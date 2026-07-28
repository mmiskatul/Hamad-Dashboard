"use client";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Numeric } from "@/components/numeric/Numeric";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import type { RenewalEntry } from "@/shared/api/types";

export function RenewalCard({ renewals }: { renewals: RenewalEntry[] }) {
  const t = useTranslations("userDetail");
  if (renewals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-base font-medium">{t("renewal")}</h3>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-[var(--text-secondary)]">—</p>
        </CardBody>
      </Card>
    );
  }
  const next = renewals[0]!;
  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-medium">{t("renewal")}</h3>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Plan</span>
          <span className="font-medium">{next.plan}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Period</span>
          <Numeric value={next.period} />
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Amount</span>
          <Numeric value={formatCurrency(next.amountUsd)} />
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">{t("nextBilling")}</span>
          <Numeric value={formatDate(next.nextBillingAt)} />
        </div>
      </CardBody>
    </Card>
  );
}