"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "@/components/data-table/ActionCell";
import { DataTable } from "@/components/data-table/DataTable";
import { Numeric } from "@/components/numeric/Numeric";
import { Button } from "@/components/ui/button";
import { GlossaryTooltip } from "@/components/ui/Glossary";
import { formatCurrency, formatNumber } from "@/shared/lib/format";

export function UsageTable({
  data,
}: {
  data: { userId: string; email: string; spend: number; tokens: number }[];
}) {
  const t = useTranslations("usage");
  const router = useRouter();
  const [searchApplied, setSearchApplied] = useState(false);
  const cols: ColumnDef<(typeof data)[number], unknown>[] = [
    { header: "User", accessorKey: "email" },
    {
      header: "Spend",
      accessorKey: "spend",
      cell: ({ row }) => <Numeric value={formatCurrency(row.original.spend)} />,
    },
    {
      header: () => (
        <span className="inline-flex items-center gap-1.5">
          Tokens
          <GlossaryTooltip term="token" />
        </span>
      ),
      accessorKey: "tokens",
      cell: ({ row }) => <Numeric value={formatNumber(row.original.tokens)} />,
    },
    {
      header: "Actions",
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <ActionCell
          actions={[{
            label: "View",
            tone: "ghost",
            icon: <ArrowUpRight size={14} />,
            onClick: () => router.push(`/admin/users/${row.original.userId}`),
          }]}
        />
      ),
    },
  ];
  return (
    <DataTable
      data={data}
      columns={cols}
      rowHref={(row) => `/admin/users/${row.userId}`}
      rowAriaLabel={(row) => `Open ${row.email}`}
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-[var(--text-secondary)]">{t("topUsers")}</span>
          <Button
            variant="primary"
            type="button"
            onClick={() => setSearchApplied(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearchApplied(true);
            }}
            aria-label={searchApplied ? t("searchApplied") : t("apply")}
          >
            <Search size={14} aria-hidden="true" />
            {t("apply")}
          </Button>
        </div>
      }
    />
  );
}