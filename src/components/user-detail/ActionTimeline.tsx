"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Numeric } from "@/components/numeric/Numeric";
import { formatRelativeTime } from "@/shared/lib/format";
import type { AuditEntry, UserActionTimelineEntry } from "@/shared/api/types";

type TimelineEntry = AuditEntry | UserActionTimelineEntry;

function isAudit(e: TimelineEntry): e is AuditEntry {
  return (e as AuditEntry).at !== undefined;
}

export function ActionTimeline({ entries }: { entries: TimelineEntry[] }) {
  const t = useTranslations("userDetail");
  const ta = useTranslations("audit.actions");
  const translate = (action: string) => {
    try {
      if (action.includes(".")) {
        return (ta as (k: string) => string)(action);
      }
      return ta(action as never);
    } catch {
      return action;
    }
  };
  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-medium">{t("activity")}</h3>
      </CardHeader>
      <CardBody className="p-0">
        {entries.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">{t("noActivity")}</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Actor</TH>
                <TH>Action</TH>
                <TH>Detail</TH>
                <TH>Source</TH>
              </TR>
            </THead>
            <TBody>
              {entries.map((e) => {
                if (isAudit(e)) {
                  return (
                    <TR key={e.id}>
                      <TD><Numeric value={formatRelativeTime(e.at)} /></TD>
                      <TD><Numeric value={e.actor} /></TD>
                      <TD><Badge tone="neutral">{translate(e.action)}</Badge></TD>
                      <TD className="text-[var(--text-secondary)]">{e.reason || e.target}</TD>
                      <TD><Badge tone="ok">audit</Badge></TD>
                    </TR>
                  );
                }
                return (
                  <TR key={e.ts + e.action}>
                    <TD><Numeric value={formatRelativeTime(e.ts)} /></TD>
                    <TD><Numeric value={e.actor} /></TD>
                    <TD><Badge tone="neutral">{translate(e.action)}</Badge></TD>
                    <TD className="text-[var(--text-secondary)]">{e.summary}</TD>
                    <TD><Badge tone="neutral">history</Badge></TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}