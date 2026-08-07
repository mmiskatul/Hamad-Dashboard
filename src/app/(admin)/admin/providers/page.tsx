"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAdminProfile, useProviders, useSetProviderStatus } from "@/shared/api/queries";
import { ProviderHealthTable } from "@/features/providers/ProviderHealthTable";
import { Button } from "@/components/ui/button";
import { DisableProviderModal } from "@/components/modals/DisableProviderModal";
import type { ProviderHealth } from "@/shared/api/types";

export default function ProvidersPage() {
  const t = useTranslations("providers");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");
  const providers = useProviders();
  const adminProfile = useAdminProfile();
  const setStatus = useSetProviderStatus();
  const [target, setTarget] = useState<ProviderHealth | null>(null);

  const handleSubmit = async (reason: string) => {
    if (!target) return;
    const next = target.status === "operational" ? "disabled" : "operational";
    const actor = adminProfile.data?.name ?? adminProfile.data?.email ?? "admin@oneai.app";
    try {
      await setStatus.mutateAsync({ providerId: target.id, status: next, reason, actor });
      toast.success(tToast(next === "operational" ? "providerEnabled" : "providerDisabled"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"));
    }
  };

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
              disabled={setStatus.isPending}
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
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}