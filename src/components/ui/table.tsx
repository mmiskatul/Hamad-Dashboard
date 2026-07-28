import { clsx } from "clsx";
import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx("w-full min-w-max border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={clsx(
        "sticky top-0 z-10 bg-[var(--bg-subtle)] text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={clsx("", className)} {...props} />;
}

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx(
        "border-b border-[var(--border-default)] hover:bg-[var(--bg-row-hover)] focus-visible:bg-[var(--bg-row-hover)]",
        className,
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={clsx(
        "h-10 px-5 text-start align-middle font-medium uppercase tracking-wider text-[var(--text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={clsx(
        "h-11 px-5 align-middle text-start text-[var(--text-primary)]",
        className,
      )}
      {...props}
    />
  );
}
