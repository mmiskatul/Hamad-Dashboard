"use client";
import { useLocale } from "next-intl";

export function useDir(): "rtl" | "ltr" {
  const locale = useLocale();
  return locale === "ar" ? "rtl" : "ltr";
}
