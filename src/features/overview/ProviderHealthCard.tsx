"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/StatusBadge";
import { Numeric } from "@/components/numeric/Numeric";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { GlossaryTooltip } from "@/components/ui/Glossary";
import { AppText } from "@/shared/ui/AppText";
import { formatPercent } from "@/shared/lib/format";
import type { ProviderHealth } from "@/shared/api/types";

const MODEL_VAR: Record<string, string> = {
  gpt: "var(--model-gpt)",
  gemini: "var(--model-gemini)",
  claude: "var(--model-claude)",
  grok: "var(--model-grok)",
  deepseek: "var(--model-deepseek)",
  perplexity: "var(--model-perplexity)",
};

export function ProviderHealthCard({ rows }: { rows: ProviderHealth[] }) {
  const t = useTranslations("overview");
  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <AppText role="card">{t("providers")}</AppText>
        </div>
        <Link href="/admin/providers">
          <Button variant="ghost" size="sm">{t("providersManage")}</Button>
        </Link>
      </CardHeader>
      <CardBody className="p-0">
        <Table>
          <THead>
            <TR>
              <TH>{t("providers")}</TH>
              <TH>{t("providersStatus")}</TH>
              <TH className="text-end">
                <span className="inline-flex items-center justify-end gap-1.5">
                  {t("providersP95")}
                  <GlossaryTooltip term="p95" />
                </span>
              </TH>
              <TH className="text-end">
                <span className="inline-flex items-center justify-end gap-1.5">
                  {t("providersErrors")}
                  <GlossaryTooltip term="errorRate" />
                </span>
              </TH>
              <TH className="text-end">
                <span className="inline-flex items-center justify-end gap-1.5">
                  {t("providersUptime")}
                  <GlossaryTooltip term="uptime" />
                </span>
              </TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((p) => (
              <TR key={p.id}>
                <TD>
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: MODEL_VAR[p.modelId] }} />
                    {p.name}
                  </span>
                </TD>
                <TD>
                  <StatusBadge
                    status={p.status === "operational" ? "ok" : p.status === "degraded" ? "warn" : "bad"}
                    label={p.status === "operational" ? t("healthOk") : p.status === "degraded" ? t("healthWarn") : t("healthBad")}
                  />
                </TD>
                <TD className="text-end"><Numeric value={`${p.p95Ms}ms`} /></TD>
                <TD className="text-end"><Numeric value={formatPercent(p.errorRate)} /></TD>
                <TD className="text-end"><Numeric value={formatPercent(p.uptime)} /></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </CardBody>
    </Card>
  );
}
