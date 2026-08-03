"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Numeric } from "@/components/numeric/Numeric";
import { formatDate, formatRelativeTime } from "@/shared/lib/format";
import type { QuotaOverride } from "@/shared/api/types";

export type QuotaOverrideDraft = Omit<QuotaOverride, "setBy" | "setAt"> & {
  /** Optional custom limits as strings while editing so blanks stay distinct from 0. */
  customRequestsLimitText?: string;
  customTokensLimitText?: string;
};

export function QuotaOverrideCard({
  current,
  actorName,
  onSave,
  onReset,
  saving = false,
}: {
  current: QuotaOverride | null;
  actorName: string;
  onSave: (next: QuotaOverride) => void | Promise<void>;
  onReset: () => void | Promise<void>;
  saving?: boolean;
}) {
  const t = useTranslations("userDetail");
  const tc = useTranslations("common");

  const [bypassQuota, setBypassQuota] = useState<boolean>(current?.bypassQuota ?? false);
  const [customRequestsText, setCustomRequestsText] = useState<string>(
    current?.customRequestsLimit != null ? String(current.customRequestsLimit) : "",
  );
  const [customTokensText, setCustomTokensText] = useState<string>(
    current?.customTokensLimit != null ? String(current.customTokensLimit) : "",
  );
  const [reason, setReason] = useState<string>(current?.reason ?? "");
  const [submitting, setSubmitting] = useState(false);

  // When the underlying override changes (e.g. after Reset), refresh local state.
  useEffect(() => {
    setBypassQuota(current?.bypassQuota ?? false);
    setCustomRequestsText(
      current?.customRequestsLimit != null ? String(current.customRequestsLimit) : "",
    );
    setCustomTokensText(
      current?.customTokensLimit != null ? String(current.customTokensLimit) : "",
    );
    setReason(current?.reason ?? "");
  }, [current]);

  const parsedRequests = customRequestsText.trim() === "" ? undefined : Number(customRequestsText);
  const parsedTokens = customTokensText.trim() === "" ? undefined : Number(customTokensText);
  const requestsValid =
    parsedRequests === undefined || (Number.isFinite(parsedRequests) && parsedRequests >= 0);
  const tokensValid =
    parsedTokens === undefined || (Number.isFinite(parsedTokens) && parsedTokens >= 0);
  const reasonValid = reason.trim().length > 0;
  const isValid = requestsValid && tokensValid && reasonValid && !submitting && !saving;

  const handleSave = async () => {
    if (!reasonValid) {
      toast.error(t("quotaOverride.errorReasonRequired"));
      return;
    }
    if (!isValid) return;
    setSubmitting(true);
    const next: QuotaOverride = {
      bypassQuota,
      customRequestsLimit: parsedRequests,
      customTokensLimit: parsedTokens,
      reason: reason.trim(),
      setBy: actorName,
      setAt: new Date().toISOString(),
    };
    try {
      await onSave(next);
      toast.success(t("quotaOverride.successSave"));
    } catch {
      toast.error(t("quotaOverride.errorReasonRequired"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    setSubmitting(true);
    try {
      await onReset();
      toast.success(t("quotaOverride.successReset"));
    } catch {
      toast.error(t("quotaOverride.errorReasonRequired"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-[var(--warning)] bg-[var(--warning-wash)]">
      <CardHeader>
        <div className="flex flex-1 items-center gap-3">
          <h3 className="text-base font-medium">{t("quotaOverride.title")}</h3>
          <Badge tone="warn" dot>
            {t("quotaOverride.warning")}
          </Badge>
        </div>
        {current && (
          <Badge tone={current.bypassQuota ? "bad" : "warn"}>
            {current.bypassQuota
              ? t("quotaOverride.bypassOn")
              : t("quotaOverride.bypassOff")}
          </Badge>
        )}
      </CardHeader>
      <CardBody className="space-y-5">
        <p className="text-sm text-[var(--text-secondary)]">{t("quotaOverride.subtitle")}</p>

        {current && (
          <div className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-sm">
            <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
              {t("quotaOverride.currentOverride")}
            </div>
            <div className="mt-2 space-y-1 text-[var(--text-secondary)]">
              {current.customRequestsLimit != null && (
                <div>
                  <Numeric value={t("quotaOverride.customRequests", { value: current.customRequestsLimit })} />
                </div>
              )}
              {current.customTokensLimit != null && (
                <div>
                  <Numeric value={t("quotaOverride.customTokens", { value: current.customTokensLimit })} />
                </div>
              )}
              <div className="text-xs">
                {t("quotaOverride.setBy", {
                  actor: current.setBy,
                  date: formatDate(current.setAt),
                })}{" "}
                <span className="text-[var(--text-secondary)]">
                  ({formatRelativeTime(current.setAt)})
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="space-y-1">
            <Label htmlFor="quota-override-bypass">{t("quotaOverride.bypassLabel")}</Label>
            <p className="text-xs text-[var(--text-secondary)]">{t("quotaOverride.bypassHelp")}</p>
          </div>
          <Switch
            id="quota-override-bypass"
            checked={bypassQuota}
            onCheckedChange={setBypassQuota}
            data-testid="quota-override-bypass"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quota-override-requests">{t("quotaOverride.customRequestsLabel")}</Label>
            <Input
              id="quota-override-requests"
              type="number"
              inputMode="numeric"
              min={0}
              value={customRequestsText}
              onChange={(e) => setCustomRequestsText(e.target.value)}
              placeholder={t("quotaOverride.customRequestsPlaceholder")}
              aria-invalid={customRequestsText.trim() !== "" && !requestsValid}
              disabled={bypassQuota}
              data-testid="quota-override-requests"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quota-override-tokens">{t("quotaOverride.customTokensLabel")}</Label>
            <Input
              id="quota-override-tokens"
              type="number"
              inputMode="numeric"
              min={0}
              value={customTokensText}
              onChange={(e) => setCustomTokensText(e.target.value)}
              placeholder={t("quotaOverride.customTokensPlaceholder")}
              aria-invalid={customTokensText.trim() !== "" && !tokensValid}
              disabled={bypassQuota}
              data-testid="quota-override-tokens"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quota-override-reason">{t("quotaOverride.reasonLabel")}</Label>
          <Textarea
            id="quota-override-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("override.reasonHint")}
            aria-invalid={!reasonValid}
            data-testid="quota-override-reason"
          />
          <p className="text-xs text-[var(--text-secondary)]">{t("quotaOverride.reasonHelp")}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!current}
            data-testid="quota-override-reset"
          >
            {t("quotaOverride.resetOverride")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isValid}
            data-testid="quota-override-save"
          >
            {tc("save")} {t("quotaOverride.saveOverride")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}