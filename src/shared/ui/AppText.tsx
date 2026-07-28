import { clsx } from "clsx";
import { type HTMLAttributes, type ReactNode } from "react";

type Role = "page" | "card" | "body" | "strong" | "caption" | "label";

const roleClass: Record<Role, string> = {
  page: "_t-page",
  card: "_t-card",
  body: "_t-body",
  strong: "_t-strong",
  caption: "_t-caption",
  label: "_t-label",
};

/**
 * Single text wrapper that enforces the type role taxonomy. §3.4.
 */
export function AppText({
  role,
  as: Tag = "p",
  className,
  children,
  ...rest
}: {
  role: Role;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "div";
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={clsx(roleClass[role], className)} {...rest}>
      {children}
    </Tag>
  );
}
