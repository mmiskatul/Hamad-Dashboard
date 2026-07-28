import { type ColumnDef, type SortingState } from "@tanstack/react-table";
import { type ReactNode } from "react";

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  search?: string;
  onSearchChange?: (value: string) => void;
  toolbar?: ReactNode;
  initialSort?: SortingState;
  emptyState?: ReactNode;
  /** Render alt mobile card list under the table at < 768px. */
  mobileCards?: (row: T) => ReactNode;
  /** Optional href builder that turns a row into a clickable link. */
  rowHref?: (row: T) => string | undefined;
  /** Optional accessible label for the clickable row. */
  rowAriaLabel?: (row: T) => string | undefined;
  /** Optional per-row predicate that disables the click handler. */
  rowDisabled?: (row: T) => boolean;
  /** Maximum number of rows shown on each page. */
  pageSize?: number;
};

export type DataTableMobileCardsProps<T> = {
  data: T[];
  render: (row: T) => ReactNode;
};
