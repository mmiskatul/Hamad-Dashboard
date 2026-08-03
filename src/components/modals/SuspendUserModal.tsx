"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";

export function SuspendUserModal({
  open,
  onOpenChange,
  onSubmit,
  isSuspended,
  submitting = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void | Promise<void>;
  isSuspended: boolean;
  submitting?: boolean;
}) {
  const t = useTranslations("userDetail");
  const tc = useTranslations("common");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setBusy(false);
    }
  }, [open]);

  const isValid = reason.trim().length >= 10 && !busy && !submitting;

  const handleConfirm = async () => {
    if (!isValid) return;
    setBusy(true);
    try {
      await onSubmit(reason.trim());
      onOpenChange(false);
    } catch {
      // Modal stays open so the admin can retry.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ariaLabel={isSuspended ? t("reactivateTitle") : t("suspendTitle")}>
        <DialogHeader>
          <DialogTitle>
            {isSuspended ? t("reactivateTitle") : t("suspendTitle")}
          </DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="suspend-reason">{t("suspendReason")}</Label>
          <Textarea
            id="suspend-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
            placeholder={t("override.reasonHint")}
            disabled={busy || submitting}
            aria-invalid={reason.length > 0 && reason.trim().length < 10}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy || submitting}>
            {tc("cancel")}
          </Button>
          <Button
            variant={isSuspended ? "primary" : "danger"}
            disabled={!isValid}
            onClick={handleConfirm}
            data-testid="suspend-confirm"
          >
            {isSuspended ? t("reactivateConfirm") : t("suspendConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
