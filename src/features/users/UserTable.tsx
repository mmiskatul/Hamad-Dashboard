"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";
import { ActionCell } from "@/components/data-table/ActionCell";
import { DataTable } from "@/components/data-table/DataTable";
import { TierBadge } from "./TierBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { Numeric } from "@/components/numeric/Numeric";
import { formatCurrency, formatPhone, formatRelativeTime } from "@/shared/lib/format";
import type { UserSummary } from "@/shared/api/types";

export function UserTable({ data }: { data: UserSummary[] }) {
  const t = useTranslations("users.columns");
  const router = useRouter();
  const columns: ColumnDef<UserSummary, unknown>[] = [
    {
      header: t("rowNumber"),
      id: "rowNumber",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="inline-block w-12 text-[var(--text-secondary)]">
          {row.index + 1}
        </span>
      ),
    },
    {
      header: t("user"),
      accessorKey: "email",
      cell: ({ row }) => (
        <Link
          href={`/admin/users/${row.original.id}`}
          className="flex flex-col leading-tight hover:text-[var(--action-primary)]"
        >
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-[var(--text-secondary)]">{row.original.email}</span>
        </Link>
      ),
    },
    {
      header: t("tier"),
      accessorKey: "tier",
      cell: ({ row }) => <TierBadge tier={row.original.tier} />,
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
    },
    {
      header: t("mobile"),
      accessorKey: "mobile",
      enableSorting: false,
      cell: ({ row }) => (
        <Numeric
          value={row.original.mobile ? formatPhone(row.original.mobile) : "—"}
          className={row.original.mobile ? undefined : "text-[var(--text-secondary)]"}
        />
      ),
    },
    {
      header: t("requests"),
      accessorKey: "requestsUsed",
      cell: ({ row }) => (
        <Numeric value={`${row.original.requestsUsed}/${row.original.requestsLimit}`} />
      ),
    },
    {
      header: t("spend"),
      accessorKey: "costUsd",
      cell: ({ row }) => <Numeric value={formatCurrency(row.original.costUsd)} />,
    },
    {
      header: t("lastActive"),
      accessorKey: "lastActiveAt",
      cell: ({ row }) => <Numeric value={formatRelativeTime(row.original.lastActiveAt)} />,
    },
    {
      header: "Actions",
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <ActionCell
          actions={[{
            label: "Open",
            icon: <ArrowUpRight size={14} />,
            tone: "ghost",
            onClick: () => router.push(`/admin/users/${row.original.id}`),
          }]}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      rowHref={(row) => `/admin/users/${row.id}`}
      rowAriaLabel={(row) => `Open ${row.name}`}
      mobileCards={(row) => (
        <div>
          <Link href={`/admin/users/${row.id}`} className="block font-medium hover:text-[var(--action-primary)]">
            {row.email}
          </Link>
          <div className="mt-1 text-xs text-[var(--text-secondary)]">
            <TierBadge tier={row.tier} /> · <UserStatusBadge status={row.status} />
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Requests</span>
              <Numeric value={`${row.requestsUsed}/${row.requestsLimit}`} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Spend</span>
              <Numeric value={formatCurrency(row.costUsd)} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Last seen</span>
              <Numeric value={formatRelativeTime(row.lastActiveAt)} />
            </div>
          </div>
          <div className="mt-3">
            <ActionCell actions={[{ label: "Open", tone: "primary", onClick: () => router.push(`/admin/users/${row.id}`) }]} />
          </div>
        </div>
      )}
    />
  );
}
