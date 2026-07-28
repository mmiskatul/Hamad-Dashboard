"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useConfigModels } from "@/shared/api/queries";
import { ModelToggleRow } from "@/features/config-models/ModelToggleRow";
import { EnabledImpactCallout } from "@/features/config-models/EnabledImpactCallout";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { GlossaryTooltip } from "@/components/ui/Glossary";
import type { ModelConfig } from "@/shared/api/types";

export default function ConfigModelsPage() {
  const t = useTranslations("configModels");
  const tCommon = useTranslations("common");
  const config = useConfigModels();
  const [rows, setRows] = useState<ModelConfig[]>([]);
  const list = rows.length ? rows : (config.data ?? []);
  const focused = list.find((r) => !r.enabled) ?? list[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] pb-5">
        <div>
          <h1 className="_t-page">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <Button variant="primary" onClick={() => setRows([])}>{t("save")}</Button>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium">{t("title")}</h2>
              <GlossaryTooltip term="modelConfiguration" />
            </div>
            <p
              data-config-description="modelConfiguration"
              className="mt-2 text-sm text-[var(--text-secondary)]"
            >
              Pick which AI models appear in your clients&apos; model picker.
              Disabling a model removes it for everyone; users who had it
              selected fall back to their tier default on the next request.
            </p>
          </CardHeader>
          <CardBody className="p-0">
            {list.map((m) => (
              <ModelToggleRow
                key={m.id}
                id={m.id}
                label={m.label}
                enabled={m.enabled}
                affectedUsers={m.affectedUsers}
                includedInTiers={m.includedInTiers}
                onToggle={(v) =>
                  setRows((prev) => {
                    const base = prev.length ? prev : list;
                    return base.map((x) => (x.id === m.id ? { ...x, enabled: v } : x));
                  })
                }
              />
            ))}
          </CardBody>
        </Card>
        {focused && <EnabledImpactCallout affectedUsers={focused.affectedUsers} />}
      </div>
      <p className="text-xs text-[var(--text-secondary)]">
        {tCommon("comingSoon")}: persistence layer will land alongside audit hooks.
      </p>
    </div>
  );
}