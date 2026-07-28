"use client";
import { useTranslations } from "next-intl";
import { type DataTableMobileCardsProps } from "./types";

export function DataTableMobileCards<T>({ data, render }: DataTableMobileCardsProps<T>) {
  const t = useTranslations("dataTable");
  return (
    <div className="grid gap-3 p-4 md:hidden">
      {data.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-6 text-center text-sm text-[var(--text-secondary)]">
          {t("empty")}
        </div>
      ) : (
        data.map((row, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-md)] border border-[var(--border-default)] p-4"
          >
            {render(row)}
          </div>
        ))
      )}
    </div>
  );
}
