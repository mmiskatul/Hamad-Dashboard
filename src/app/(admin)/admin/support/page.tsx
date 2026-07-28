"use client";
import { useTranslations } from "next-intl";
import { useTickets } from "@/shared/api/queries";
import { SupportQueue } from "@/features/support/SupportQueue";

export default function SupportPage() {
  const t = useTranslations("support");
  const tickets = useTickets();
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>
      {tickets.data && <SupportQueue tickets={tickets.data} />}
    </div>
  );
}