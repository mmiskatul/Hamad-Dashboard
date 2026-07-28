"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const t = useTranslations("globalError");
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {error.message || t("body")}
        </p>
        <Button className="mt-4" variant="primary" onClick={reset}>
          {t("cta")}
        </Button>
      </div>
    </div>
  );
}