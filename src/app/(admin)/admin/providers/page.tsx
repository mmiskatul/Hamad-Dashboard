"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useProviders } from "@/shared/api/queries";
import { ProviderHealthTable } from "@/features/providers/ProviderHealthTable";
import { Button } from "@/components/ui/button";
import { DisableProviderModal } from "@/components/modals/DisableProviderModal";
import type { ProviderHealth } from "@/shared/api/types";

export default function ProvidersPage() {
  const t = useTranslations("providers");
  const providers = useProviders();
  const [target, setTarget] = useState<ProviderHealth | null>(null);
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] pb-5">
        <div>
          <h1 className="_t-page">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
      </div>
      {providers.data && <ProviderHealthTable rows={providers.data} />}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {providers.data?.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--e1)]">
            <span className="font-medium">{p.name}</span>
            <Button
              variant={p.status === "operational" ? "ghost" : "danger"}
              size="sm"
              onClick={() => setTarget(p)}
            >
              {p.status === "operational" ? t("disable") : t("enable")}
            </Button>
          </div>
        ))}
      </div>
      {target && (
        <DisableProviderModal
          open={Boolean(target)}
          onOpenChange={(o) => !o && setTarget(null)}
          providerName={target.name}
          affectedUsers={47}
          isEnabled={target.status === "operational"}
          onSubmit={() => {}}
        />
      )}
    </div>
  );
}