"use client";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Numeric } from "@/components/numeric/Numeric";
import { formatRelativeTime } from "@/shared/lib/format";
import type { QuotaHistoryEntry } from "@/shared/api/types";

export function QuotaHistory({ entries }: { entries: QuotaHistoryEntry[] }) {
  const t = useTranslations("userDetail");
  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-medium">{t("quotaHistory")}</h3>
      </CardHeader>
      <CardBody className="p-0">
        {entries.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">{t("noQuotaHistory")}</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Amount</TH>
                <TH>New total</TH>
                <TH>By</TH>
                <TH>Reason</TH>
              </TR>
            </THead>
            <TBody>
              {entries.map((q, i) => (
                <TR key={i}>
                  <TD><Numeric value={formatRelativeTime(q.date)} /></TD>
                  <TD><Numeric value={`+${q.amount}`} /></TD>
                  <TD><Numeric value={q.newTotal ?? "—"} /></TD>
                  <TD><Numeric value={q.by} /></TD>
                  <TD className="text-[var(--text-secondary)]">{q.reason}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}