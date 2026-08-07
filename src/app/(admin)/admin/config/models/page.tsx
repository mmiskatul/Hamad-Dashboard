"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useConfigModels,
  useUpdateModels,
  useAdminProfile,
} from "@/shared/api/queries";
import { ModelToggleRow } from "@/features/config-models/ModelToggleRow";
import { EnabledImpactCallout } from "@/features/config-models/EnabledImpactCallout";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { GlossaryTooltip } from "@/components/ui/Glossary";
import { Label, Textarea } from "@/components/ui/input";
import type { ModelConfig } from "@/shared/api/types";

export default function ConfigModelsPage() {
  const t = useTranslations("configModels");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");
  const config = useConfigModels();
  const update = useUpdateModels();
  const adminProfile = useAdminProfile();
  const [rows, setRows] = useState<ModelConfig[] | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (config.data && !rows) {
      setRows(config.data.map((m) => ({ ...m })));
    }
  }, [config.data, rows]);

  const list = rows ?? [];
  const focused = list.find((r) => !r.enabled) ?? list[0];

  const dirty = useMemo(() => {
    if (!config.data || !rows) return false;
    return JSON.stringify(rows) !== JSON.stringify(config.data);
  }, [rows, config.data]);

  const validReason = reason.trim().length >= 10;

  const onSave = async () => {
    if (!rows || !validReason) return;
    const actor = adminProfile.data?.name ?? adminProfile.data?.email ?? "admin@oneai.app";
    await update.mutateAsync({ models: rows, actor, reason: reason.trim() });
    toast.success(tToast("saved"));
    setReasonOpen(false);
    setReason("");
    setRows(null);
  };

  const onReset = () => {
    if (!config.data) return;
    setRows(config.data.map((m) => ({ ...m })));
  };

  if (!config.data || !rows) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] pb-5">
        <div>
          <h1 className="_t-page">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onReset} disabled={!dirty}>
            {tCommon("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => setReasonOpen(true)}
            disabled={!dirty || update.isPending}
          >
            {t("save")}
          </Button>
        </div>
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
                    const base = prev ?? list;
                    return base.map((x) => (x.id === m.id ? { ...x, enabled: v } : x));
                  })
                }
              />
            ))}
          </CardBody>
        </Card>
        {focused && <EnabledImpactCallout affectedUsers={focused.affectedUsers} />}
      </div>

      <Dialog
        open={reasonOpen}
        onOpenChange={(open) => {
          if (!open) {
            setReasonOpen(false);
            setReason("");
          }
        }}
      >
        <DialogContent ariaLabel={t("save")}>
          <DialogHeader>
            <DialogTitle>{t("save")}</DialogTitle>
            <DialogDescription>Reason for change (≥ 10 characters)</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="models-reason">{t("save")}</Label>
            <Textarea
              id="models-reason"
              data-testid="models-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for change (≥ 10 characters)"
              className="mt-2"
            />
            {!validReason && reason.length > 0 && (
              <p className="mt-1 text-xs text-[var(--danger-text)]">
                Reason must be at least 10 characters.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReasonOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="primary"
              data-testid="models-confirm"
              disabled={!validReason || update.isPending}
              onClick={onSave}
            >
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}