import { ShieldX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ForbiddenState() {
  const t = useTranslations("systemStates.forbidden");
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center">
      <ShieldX size={36} className="text-[var(--text-secondary)]" aria-hidden />
      <h2 className="text-xl font-medium">{t("title")}</h2>
      <p className="max-w-md text-sm text-[var(--text-secondary)]">{t("body")}</p>
      <Button variant="primary">{t("cta")}</Button>
    </div>
  );
}