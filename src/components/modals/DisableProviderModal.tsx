"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";
import { Numeric } from "@/components/numeric/Numeric";

export function DisableProviderModal({
  open,
  onOpenChange,
  providerName,
  affectedUsers,
  onSubmit,
  isEnabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerName: string;
  affectedUsers: number;
  onSubmit: (reason: string) => void;
  isEnabled: boolean;
}) {
  const t = useTranslations("providers");
  const tc = useTranslations("common");
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ariaLabel={t("disableTitle")}>
        <DialogHeader>
          <DialogTitle>{t("disableTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3 text-sm">
            <strong className="block">{providerName}</strong>
            <span className="text-[var(--text-secondary)]">
              {t("disableImpact", { count: affectedUsers })}
            </span>{" "}
            <Numeric value={affectedUsers} />
          </div>
          <div>
            <Label htmlFor="reason">{t("disableReason")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
              placeholder={tc("apply")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {tc("cancel")}
          </Button>
          <Button
            variant={isEnabled ? "danger" : "primary"}
            disabled={reason.trim().length < 10}
            onClick={() => {
              onSubmit(reason);
              toast.success(isEnabled ? "providerDisabled" : "providerEnabled");
              onOpenChange(false);
            }}
          >
            {isEnabled ? t("disableConfirm") : t("enable")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
