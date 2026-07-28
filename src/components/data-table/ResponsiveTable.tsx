import { type ReactNode } from "react";

/**
 * Responsive table shell. Desktop content scrolls horizontally instead of
 * squashing columns; callers can provide a mobile card view separately.
 */
export function ResponsiveTable({
  children,
  mobileCards,
}: {
  children: ReactNode;
  mobileCards?: ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">{children}</div>
      {mobileCards ? <div className="md:hidden">{mobileCards}</div> : null}
    </>
  );
}
