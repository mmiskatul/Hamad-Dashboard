"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Numeric } from "@/components/numeric/Numeric";
import { useUnitPricing, useUpdateUnitPricing } from "@/shared/api/queries";
import { formatRelativeTime } from "@/shared/lib/format";
import type { UnitPricingConfig } from "@/shared/api/types";

type UnitKey = "request" | "token";

type SectionKey = "requestUnit" | "tokenUnit";

type FormState = {
  requestUnit: { size: string; priceUsd: string; enabled: boolean };
  tokenUnit: { size: string; priceUsd: string; enabled: boolean };
};

function asFormState(cfg: UnitPricingConfig): FormState {
  return {
    requestUnit: {
      size: String(cfg.requestUnit.size),
      priceUsd: String(cfg.requestUnit.priceUsd),
      enabled: cfg.requestUnit.enabled,
    },
    tokenUnit: {
      size: String(cfg.tokenUnit.size),
      priceUsd: String(cfg.tokenUnit.priceUsd),
      enabled: cfg.tokenUnit.enabled,
    },
  };
}

export default function ConfigPricingPage() {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const query = useUnitPricing();
  const mutation = useUpdateUnitPricing();
  const [form, setForm] = useState<FormState | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (query.data && !form) setForm(asFormState(query.data));
  }, [query.data, form]);

  const preview = useMemo(() => {
    if (!form) return null;
    const reqSize = Number(form.requestUnit.size) || 0;
    const reqPrice = Number(form.requestUnit.priceUsd) || 0;
    const tokSize = Number(form.tokenUnit.size) || 0;
    const tokPrice = Number(form.tokenUnit.priceUsd) || 0;
    return {
      requestCostPer1k: reqSize > 0 ? (reqPrice / reqSize) * 1000 : 0,
      tokenCostPer1k: tokSize > 0 ? (tokPrice / tokSize) * 1000 : 0,
    };
  }, [form]);

  if (query.isLoading || !query.data || !form) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[var(--border-default)] pb-5">
          <h1 className="_t-page">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{tCommon("loading")}</p>
      </div>
    );
  }

  const openReasonModal = (section: SectionKey) => {
    setActiveSection(section);
    setReason("");
  };

  const closeReasonModal = () => {
    setActiveSection(null);
    setReason("");
  };

  const handleConfirmSave = () => {
    if (!activeSection) return;
    const section = form[activeSection];
    const size = Number(section.size);
    const priceUsd = Number(section.priceUsd);
    if (!Number.isFinite(size) || size < 1) return;
    if (!Number.isFinite(priceUsd) || priceUsd < 0) return;
    if (reason.trim().length < 10) return;
    const payload = {
      [activeSection]: { size, priceUsd, enabled: section.enabled },
      reason: reason.trim(),
    } as Parameters<typeof mutation.mutate>[0];
    mutation.mutate(payload, {
      onSuccess: (next) => {
        setForm(asFormState(next));
        toast.success(tCommon("save"));
        closeReasonModal();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UnitSection
          sectionKey="requestUnit"
          unitKey="request"
          title={t("requestUnit")}
          form={form.requestUnit}
          row={query.data.requestUnit}
          t={t}
          tCommon={tCommon}
          previewValue={preview?.requestCostPer1k ?? 0}
          previewUnit={`${t("unitSize")} · 1k`}
          onChange={(patch) =>
            setForm((prev) =>
              prev ? { ...prev, requestUnit: { ...prev.requestUnit, ...patch } } : prev,
            )
          }
          onSave={() => openReasonModal("requestUnit")}
        />
        <UnitSection
          sectionKey="tokenUnit"
          unitKey="token"
          title={t("tokenUnit")}
          form={form.tokenUnit}
          row={query.data.tokenUnit}
          t={t}
          tCommon={tCommon}
          previewValue={preview?.tokenCostPer1k ?? 0}
          previewUnit={`${t("unitSize")} · 1k`}
          onChange={(patch) =>
            setForm((prev) =>
              prev ? { ...prev, tokenUnit: { ...prev.tokenUnit, ...patch } } : prev,
            )
          }
          onSave={() => openReasonModal("tokenUnit")}
        />
      </div>

      <HistoryCard
        history={query.data.history}
        t={t}
      />

      <Dialog
        open={activeSection !== null}
        onOpenChange={(open) => {
          if (!open) closeReasonModal();
        }}
      >
        <DialogContent ariaLabel={t("save")}>
          <DialogHeader>
            <DialogTitle>{t("save")}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{t("reasonHint")}</DialogDescription>
          <div>
            <Label htmlFor="pricing-reason">{t("save")}</Label>
            <textarea
              id="pricing-reason"
              data-testid="pricing-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[88px] mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              placeholder={t("reasonHint")}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeReasonModal}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="primary"
              data-testid="pricing-confirm"
              disabled={reason.trim().length < 10 || mutation.isPending}
              onClick={handleConfirmSave}
            >
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UnitSection({
  sectionKey,
  unitKey,
  title,
  form,
  row,
  t,
  tCommon,
  previewValue,
  previewUnit,
  onChange,
  onSave,
}: {
  sectionKey: SectionKey;
  unitKey: UnitKey;
  title: string;
  form: { size: string; priceUsd: string; enabled: boolean };
  row: { size: number; priceUsd: number; enabled: boolean; updatedAt: string; updatedBy: string };
  t: ReturnType<typeof useTranslations<"pricing">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
  previewValue: number;
  previewUnit: string;
  onChange: (patch: { size?: string; priceUsd?: string; enabled?: boolean }) => void;
  onSave: () => void;
}) {
  return (
    <Card data-unit-section={unitKey}>
      <CardHeader>
        <h2 className="grow text-base font-medium">{title}</h2>
        <Switch
          checked={form.enabled}
          onCheckedChange={(v) => onChange({ enabled: v })}
          aria-label={t("unitEnabled")}
        />
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${sectionKey}-size`}>{t("unitSize")}</Label>
          <Input
            id={`${sectionKey}-size`}
            data-testid={`${sectionKey}-size`}
            type="number"
            min={1}
            value={form.size}
            onChange={(e) => onChange({ size: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${sectionKey}-price`}>{t("unitPrice")}</Label>
          <Input
            id={`${sectionKey}-price`}
            data-testid={`${sectionKey}-price`}
            type="number"
            min={0}
            step="0.01"
            suffix={tCommon("usdShort")}
            value={form.priceUsd}
            onChange={(e) => onChange({ priceUsd: e.target.value })}
          />
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-secondary)]">
          <span className="block font-medium text-[var(--text-primary)]">{t("preview")}</span>
          <span>
            <Numeric value={previewValue.toFixed(4)} suffix=" USD" /> · {previewUnit}
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          {t("lastUpdated", { ago: formatRelativeTime(row.updatedAt), by: row.updatedBy })}
        </p>
        <div className="flex justify-end">
          <Button variant="primary" data-testid={`${sectionKey}-save`} onClick={onSave}>
            {t("save")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function HistoryCard({
  history,
  t,
}: {
  history: UnitPricingConfig["history"];
  t: ReturnType<typeof useTranslations<"pricing">>;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="grow text-base font-medium">{t("history")}</h2>
      </CardHeader>
      <CardBody>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">{t("historyEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li
                key={`${h.ts}-${i}`}
                className="rounded-[var(--radius-sm)] border border-[var(--border-default)] p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">{h.unit}</span>
                  <Numeric value={h.ts} />
                </div>
                <p className="text-[var(--text-secondary)]">{h.reason}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {h.actor} · {h.before.size}→{h.after.size} · {h.before.priceUsd}→{h.after.priceUsd}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
