import { clsx } from "clsx";
import { type HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--e1)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "flex items-center gap-4 border-b border-[var(--border-default)] px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("p-6", className)} {...props} />;
}
