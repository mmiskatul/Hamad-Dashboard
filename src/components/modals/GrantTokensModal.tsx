"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";

export type GrantTokensInput = {
  amount: number;
  reason: string;
};

export function GrantTokensModal({
  open,
  onOpenChange,
  onSubmit,
  defaultAmount = 500,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: GrantTokensInput) => void | Promise<void>;
  defaultAmount?: number;
}) {
  const t = useTranslations("userDetail");
  const tc = useTranslations("common");
  const [amount, setAmount] = useState<string>(String(defaultAmount));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset fields whenever the dialog re-opens so re-grants start clean.
  useEffect(() => {
    if (open) {
      setAmount(String(defaultAmount));
      setReason("");
    }
  }, [open, defaultAmount]);

  const numericAmount = Number(amount);
  const amountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const isValid = amountValid && !submitting;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit({ amount: numericAmount, reason: reason.trim() });
      toast.success(t("grantTokensSuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("grantTokensError"));
      // keep modal open so the admin can retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ariaLabel={t("grantTokensTitle")}>
        <DialogHeader>
          <DialogTitle>{t("grantTokensTitle")}</DialogTitle>
          <DialogDescription>{t("grantTokensSubtitle")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grant-tokens-amount">{t("grantTokensAmount")}</Label>
            <Input
              id="grant-tokens-amount"
              type="number"
              inputMode="numeric"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={amount.length > 0 && !amountValid}
              placeholder={String(defaultAmount)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grant-tokens-reason">{t("grantTokensReason")}</Label>
            <Textarea
              id="grant-tokens-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("override.reasonHint")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            {tc("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid}
            data-testid="grant-tokens-submit"
          >
            {t("grantTokensConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
