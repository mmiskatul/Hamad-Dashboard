"use client";
import { useState } from "react";
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
import { Input, Label } from "@/components/ui/input";
import type { Tier, UserStatus } from "@/shared/api/types";

export type CreateUserInput = {
  name: string;
  email: string;
  tier: Tier;
  status: UserStatus;
};

export function CreateUserModal({
  open,
  onOpenChange,
  onSubmit,
  defaultTier = "free",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateUserInput) => void | Promise<void>;
  defaultTier?: Tier;
}) {
  const t = useTranslations("users.create");
  const tc = useTranslations("common");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Tier>(defaultTier);
  const [status, setStatus] = useState<UserStatus>("active");
  const [submitting, setSubmitting] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nameValid = name.trim().length >= 2;
  const isValid = emailValid && nameValid && !submitting;

  const reset = () => {
    setName("");
    setEmail("");
    setTier(defaultTier);
    setStatus("active");
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        tier,
        status,
      });
      toast.success(t("success"));
      reset();
      onOpenChange(false);
    } catch {
      toast.error(t("error"));
      // keep modal open so the admin can retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent ariaLabel={t("title")}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-user-name">{t("name")}</Label>
            <Input
              id="create-user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              placeholder={t("namePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-user-email">{t("email")}</Label>
            <Input
              id="create-user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              placeholder={t("emailPlaceholder")}
              aria-invalid={email.length > 0 && !emailValid}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-user-tier">{t("tier")}</Label>
              <select
                id="create-user-tier"
                value={tier}
                onChange={(e) => setTier(e.target.value as Tier)}
                className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              >
                <option value="free">{t("tierFree")}</option>
                <option value="pro">{t("tierPro")}</option>
                <option value="business">{t("tierBusiness")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-user-status">{t("status")}</Label>
              <select
                id="create-user-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              >
                <option value="active">{t("statusActive")}</option>
                <option value="grace">{t("statusGrace")}</option>
                <option value="suspended">{t("statusSuspended")}</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {tc("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid}
            data-testid="create-user-submit"
          >
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
