"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("body")}</p>
        <Link href={`/${locale}/login`} className="mt-4 inline-block">
          <Button variant="primary">{t("cta")}</Button>
        </Link>
      </div>
    </div>
  );
}