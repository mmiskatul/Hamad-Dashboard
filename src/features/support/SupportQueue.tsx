"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Numeric } from "@/components/numeric/Numeric";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ActionCell } from "@/components/data-table/ActionCell";
import { formatRelativeTime } from "@/shared/lib/format";
import { type Ticket } from "@/shared/api/types";

export function SupportQueue({ tickets }: { tickets: Ticket[] }) {
  const ts = useTranslations("support.status");
  const tp = useTranslations("support.priority");
  const router = useRouter();
  const goTo = (id: string) => router.push(`/admin/support/${id}`);
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--e1)]">
      <Table>
        <THead>
          <TR>
            <TH>Subject</TH>
            <TH>User</TH>
            <TH>Status</TH>
            <TH>Priority</TH>
            <TH className="text-end">Updated</TH>
            <TH className="text-end">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              role="row"
              tabIndex={0}
              aria-label={`Open ticket ${t.subject}`}
              className="cursor-pointer border-b border-[var(--border-default)] hover:bg-[var(--bg-row-hover)] focus-visible:bg-[var(--bg-row-hover)]"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("button, a, [data-row-stop]")) return;
                goTo(t.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !(event.target as HTMLElement).closest("button, a, [data-row-stop]")) {
                  event.preventDefault();
                  goTo(t.id);
                }
              }}
            >
              <TD>
                <Link href={`/admin/support/${t.id}`} className="font-medium hover:text-[var(--action-primary)]">
                  {t.subject}
                </Link>
                {t.hasAttachment && (
                  <Badge tone="neutral" className="ms-2">Attachment</Badge>
                )}
              </TD>
              <TD>
                <span className="_num">{t.userEmail}</span>
              </TD>
              <TD>
                <Badge tone={t.status === "open" ? "warn" : t.status === "pending" ? "neutral" : "ok"}>
                  {ts(t.status)}
                </Badge>
              </TD>
              <TD>
                <Badge
                  tone={
                    t.priority === "low"
                      ? "neutral"
                      : t.priority === "normal"
                      ? "warn"
                      : "ok"
                  }
                >
                  {tp(t.priority)}
                </Badge>
              </TD>
              <TD className="text-end">
                <Numeric value={formatRelativeTime(t.updatedAt)} />
              </TD>
              <TD className="text-end">
                <ActionCell
                  actions={[{
                    label: "Open",
                    tone: "ghost",
                    icon: <ArrowUpRight size={14} />,
                    onClick: () => goTo(t.id),
                  }]}
                />
              </TD>
            </tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}