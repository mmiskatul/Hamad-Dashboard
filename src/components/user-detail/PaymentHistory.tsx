"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Numeric } from "@/components/numeric/Numeric";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import type { PaymentHistoryEntry } from "@/shared/api/types";

export function PaymentHistory({ entries }: { entries: PaymentHistoryEntry[] }) {
  const t = useTranslations("userDetail");
  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-medium">{t("paymentHistory")}</h3>
      </CardHeader>
      <CardBody className="p-0">
        {entries.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">{t("noPayments")}</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("meta.signupDate")}</TH>
                <TH>Plan</TH>
                <TH>Period</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {entries.map((p, i) => (
                <TR key={i}>
                  <TD><Numeric value={formatDate(p.date)} /></TD>
                  <TD>{p.plan}</TD>
                  <TD>{p.period}</TD>
                  <TD><Numeric value={formatCurrency(p.amountUsd)} /></TD>
                  <TD>
                    <Badge
                      tone={
                        p.status === "succeeded"
                          ? "ok"
                          : p.status === "failed"
                            ? "bad"
                            : p.status === "refunded"
                              ? "neutral"
                              : "warn"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}