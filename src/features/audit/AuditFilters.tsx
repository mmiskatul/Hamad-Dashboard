"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

export function AuditFilters({
  action,
  onActionChange,
}: {
  action: string;
  onActionChange: (v: string) => void;
}) {
  const t = useTranslations("audit.filters");
  const ta = useTranslations("audit.actions");
  const opts = [
    "login",
    "quotaOverride",
    "userStatus",
    "providerToggle",
    "tierChange",
    "modelToggle",
    "sessionRevoked",
    "tier.update",
    "model.toggle",
    "usage.toggle",
    "legal.publish",
    "legal.restore",
    "legal.delete",
    "support.reply",
    "support.close",
  ] as const;
  const label = (opt: string) => {
    try {
      // next-intl rejects keys with dots; map dotted actions to nested keys.
      if (opt.includes(".")) {
        return (ta as (k: string) => string)(opt);
      }
      return ta(opt as never);
    } catch {
      return opt;
    }
  };
  return (
    <Select value={action} onValueChange={onActionChange}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder={t("action")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{t("action")}</SelectItem>
        {opts.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {label(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}