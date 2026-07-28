"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TierCard } from "./TierCard";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";
import { Numeric } from "@/components/numeric/Numeric";
import {
  useConfigModels,
  useConfigTiers,
  usePlanDefaults,
  useUpdateTiers,
} from "@/shared/api/queries";
import type { TierConfig } from "@/shared/api/types";

export function TierEditor() {
  const t = useTranslations("configTiers");
  const tc = useTranslations("common");
  const tToast = useTranslations("toast");
  const tiers = useConfigTiers();
  const defaults = usePlanDefaults();
  const models = useConfigModels();
  const mutation = useUpdateTiers();

  const [draft, setDraft] = useState<TierConfig[] | null>(null);
  const [resetBaseline, setResetBaseline] = useState<TierConfig[] | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const validReason = reason.trim().length >= 10;

  useEffect(() => {
    if (tiers.data && !draft) {
      setDraft(tiers.data.map((tier) => ({
        ...tier,
        models: [...tier.models],
        features: { ...tier.features },
      })));
    }
  }, [tiers.data, draft]);

  useEffect(() => {
    if (defaults.data && !resetBaseline) {
      setResetBaseline(defaults.data.map((tier) => ({
        ...tier,
        models: [...tier.models],
        features: { ...tier.features },
      })));
    }
  }, [defaults.data, resetBaseline]);

  const dirty =
    !!draft &&
    !!tiers.data &&
    JSON.stringify(draft) !== JSON.stringify(tiers.data);

  const onSave = async () => {
    if (!draft || !validReason) return;
    await mutation.mutateAsync({
      tiers: draft,
      actor: "admin@oneai.app",
      reason,
    });
    toast.success(tToast("tiersPublished"));
    setReasonOpen(false);
    setReason("");
    setDraft(null);
  };

  const onReset = () => {
    if (!resetBaseline) return;
    setDraft(resetBaseline.map((tier) => ({
      ...tier,
      models: [...tier.models],
      features: { ...tier.features },
    })));
    toast.success(tToast("tiersReset"));
  };

  if (!draft || !models.data) {
    return <Card><CardBody><p className="text-sm text-[var(--text-secondary)]">{tc("loading")}</p></CardBody></Card>;
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="grow">
            <h2 className="text-base font-medium">{t("title")}</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {dirty ? "Unsaved changes" : "Up to date"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onReset} disabled={!dirty}>
              {t("reset")}
            </Button>
            <Button variant="primary" disabled={!dirty} onClick={() => setReasonOpen(true)}>
              {t("save")}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {draft.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                models={models.data}
                onChange={(next) =>
                  setDraft((prev) =>
                    prev ? prev.map((x) => (x.id === tier.id ? next : x)) : prev,
                  )
                }
              />
            ))}
          </div>
        </CardBody>
      </Card>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent ariaLabel={t("saveReason")}>
          <div className="space-y-3">
            <DialogHeader>
              <DialogTitle>{t("saveReason")}</DialogTitle>
            </DialogHeader>
            <Label htmlFor="tier-reason">{t("saveReason")}</Label>
            <Textarea
              id="tier-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("saveReason")}
              className="mt-2"
            />
            {!validReason && reason.length > 0 && (
              <p className="mt-1 text-xs text-[var(--danger-text)]">
                <Numeric value={10} /> characters minimum.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReasonOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button variant="primary" disabled={!validReason} onClick={onSave}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}