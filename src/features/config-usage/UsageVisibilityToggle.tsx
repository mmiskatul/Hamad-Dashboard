"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useSetUsageVisibility, useUsageVisibility } from "@/shared/api/queries";
import { formatRelativeTime } from "@/shared/lib/format";

export function UsageVisibilityToggle() {
  const t = useTranslations("usageToggle");
  const query = useUsageVisibility();
  const mutation = useSetUsageVisibility();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (query.data) setEnabled(query.data.enabled);
  }, [query.data]);

  if (query.isLoading || !query.data || enabled === null) {
    return (
      <Card>
        <CardHeader>
          <p className="grow text-sm text-[var(--text-secondary)]">Loading…</p>
        </CardHeader>
      </Card>
    );
  }

  const onChange = (next: boolean) => {
    setEnabled(next);
    const payload = {
      enabled: next,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin@oneai.app",
    };
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(next ? t("toggleOn") : t("toggleOff"));
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <h2 className="text-base font-medium">{t("title")}</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onChange}
          aria-label={t("title")}
        />
      </CardHeader>
      <CardBody className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span
          className={enabled ? "text-[var(--success-text)]" : "text-[var(--text-secondary)]"}
        >
          {enabled ? t("enabled") : t("disabled")}
        </span>
        <span>
          {t("lastUpdated", { ago: formatRelativeTime(query.data.updatedAt), by: query.data.updatedBy })}
        </span>
      </CardBody>
    </Card>
  );
}