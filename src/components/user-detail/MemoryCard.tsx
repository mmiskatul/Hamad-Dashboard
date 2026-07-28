"use client";
import { useTranslations } from "next-intl";
import { Brain } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Numeric } from "@/components/numeric/Numeric";
import { formatBytes, formatRelativeTime } from "@/shared/lib/format";
import type { UserMemorySummary } from "@/shared/api/types";

export function MemoryCard({ memory }: { memory: UserMemorySummary }) {
  const t = useTranslations("userDetail");
  const isEmpty = memory.count === 0;
  return (
    <Card>
      <CardHeader>
        <div className="flex grow items-center gap-2">
          <Brain size={16} aria-hidden className="text-[var(--text-secondary)]" />
          <h3 className="text-base font-medium">{t("memory")}</h3>
        </div>
        {!isEmpty && (
          <Badge tone="ok" aria-label={t("memory")}>
            <Numeric value={memory.count} />
          </Badge>
        )}
      </CardHeader>
      <CardBody className="space-y-3 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-[var(--text-secondary)]">{t("memoryEntries")}</span>
          <Numeric value={memory.count} className="text-lg font-medium" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[var(--text-secondary)]">{t("memorySize")}</span>
          <Numeric value={formatBytes(memory.bytesUsed)} />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[var(--text-secondary)]">{t("memoryUpdated")}</span>
          <Numeric value={formatRelativeTime(memory.lastUpdatedAt)} />
        </div>
        {memory.topCategories.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[var(--text-secondary)]">{t("memoryCategories")}</span>
            <div className="flex flex-wrap gap-1.5">
              {memory.topCategories.map((cat) => (
                <Badge key={cat} tone="neutral">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {isEmpty && (
          <p className="pt-1 text-xs text-[var(--text-secondary)]">{t("memoryEmpty")}</p>
        )}
      </CardBody>
    </Card>
  );
}
