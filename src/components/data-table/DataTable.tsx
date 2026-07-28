"use client";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { DataTableMobileCards } from "./DataTableMobileCards";
import { DataTablePagination } from "./DataTablePagination";
import { type DataTableProps } from "./types";

export const DEFAULT_PAGE_SIZE = 20;

export function DataTable<T>({
  data,
  columns,
  search,
  onSearchChange,
  toolbar,
  initialSort,
  emptyState,
  mobileCards,
  rowHref,
  rowAriaLabel,
  rowDisabled,
  pageSize = DEFAULT_PAGE_SIZE,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState(initialSort ?? []);
  const [localSearch, setLocalSearch] = useState("");
  const t = useTranslations("table");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = (search ?? localSearch).trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(q),
    );
  }, [data, search, localSearch]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    initialState: { pagination: { pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalRows = filtered.length;
  const shouldPaginate = totalRows > pageSize;

  const renderRow = (row: Row<T>) => {
    const href = rowHref?.(row.original);
    const disabled = rowDisabled?.(row.original) ?? false;
    const cells = row.getVisibleCells().map((cell) => (
      <TD key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TD>
    ));
    if (href && !disabled) {
      const onClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
        const target = event.target as HTMLElement;
        // Inner buttons/links/labels short-circuit row navigation.
        if (
          target.closest(
            'button, a, input, select, textarea, summary, [role="button"], [role="link"], [role="menuitem"], [data-row-link-ignore]',
          )
        )
          return;
        router.push(href);
      };
      const onKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
        if (event.key === "Enter") {
          const target = event.target as HTMLElement;
          if (
            target.closest(
              'button, a, input, select, textarea, summary, [role="button"], [role="link"], [role="menuitem"], [data-row-link-ignore]',
            )
          )
            return;
          event.preventDefault();
          router.push(href);
        }
      };
      return (
        <tr
          key={row.id}
          role="row"
          tabIndex={0}
          aria-label={rowAriaLabel?.(row.original)}
          onClick={onClick}
          onKeyDown={onKeyDown}
          className="cursor-pointer border-b border-[var(--border-default)] hover:bg-[var(--bg-row-hover)] focus-visible:bg-[var(--bg-row-hover)]"
        >
          {cells}
        </tr>
      );
    }
    return <TR key={row.id}>{cells}</TR>;
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--e1)]">
      {(onSearchChange || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border-default)] p-4">
          {(onSearchChange || true) && (
            <div className="grow">
              <Input
                value={search ?? localSearch}
                onChange={(e) =>
                  onSearchChange ? onSearchChange(e.target.value) : setLocalSearch(e.target.value)
                }
                placeholder="Search"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div className="hidden md:block">
        <Table>
          <THead>
            {table.getHeaderGroups().map((hg) => (
              <TR key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <TH
                      key={header.id}
                      className={canSort ? "cursor-pointer select-none" : undefined}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={
                        sortDir === "asc"
                          ? "ascending"
                          : sortDir === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="ms-1 text-[10px] opacity-60">
                          {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "↕"}
                        </span>
                      )}
                    </TH>
                  );
                })}
              </TR>
            ))}
          </THead>
          <TBody>
            {table.getRowModel().rows.length === 0 ? (
              <TR>
                <TD colSpan={columns.length} className="text-center text-[var(--text-secondary)]">
                  {emptyState ?? <span>{t("empty")}</span>}
                </TD>
              </TR>
            ) : (
              table.getRowModel().rows.map(renderRow)
            )}
          </TBody>
        </Table>
      </div>

      {mobileCards && <DataTableMobileCards data={table.getRowModel().rows.map((r) => r.original)} render={mobileCards} />}

      {shouldPaginate && (
        <DataTablePagination
          page={table.getState().pagination.pageIndex + 1}
          totalPages={Math.max(1, table.getPageCount())}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      )}
    </div>
  );
}
