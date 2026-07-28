"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Numeric } from "@/components/numeric/Numeric";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { formatRelativeTime } from "@/shared/lib/format";
import type { AuditEntry } from "@/shared/api/types";

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  const t = useTranslations("audit.columns");
  const ta = useTranslations("audit.actions");
  const translate = (action: string) => {
    try {
      // next-intl rejects keys with dots; map dotted actions to nested keys.
      if (action.includes(".")) {
        return (ta as (k: string) => string)(action);
      }
      return ta(action as never);
    } catch {
      return action;
    }
  };
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--e1)]">
      <Table>
        <THead>
          <TR>
            <TH>{t("time")}</TH>
            <TH>{t("actor")}</TH>
            <TH>{t("action")}</TH>
            <TH>{t("target")}</TH>
            <TH>{t("reason")}</TH>
          </TR>
        </THead>
        <TBody>
          {entries.map((e) => (
            <TR key={e.id}>
              <TD>
                <Numeric value={formatRelativeTime(e.at)} />
              </TD>
              <TD>
                <span className="_num">{e.actor}</span>
              </TD>
              <TD>
                <Badge tone="neutral">{translate(e.action)}</Badge>
              </TD>
              <TD>
                <span className="_num">{e.target}</span>
              </TD>
              <TD className="text-[var(--text-secondary)]">{e.reason}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
