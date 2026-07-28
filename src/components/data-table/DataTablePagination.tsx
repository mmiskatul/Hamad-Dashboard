"use client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("common");
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-secondary)]">
      <span>
        {t("page")} <span className="font-medium text-[var(--text-primary)]">{page}</span> {t("of")}{" "}
        <span className="font-medium text-[var(--text-primary)]">{totalPages}</span>
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
