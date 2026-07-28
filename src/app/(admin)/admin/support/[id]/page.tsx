"use client";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTicket, useTicketReplies } from "@/shared/api/queries";
import { TicketStatusBadge } from "@/features/support/TicketStatusBadge";
import { AttachmentBanner } from "@/features/support/AttachmentBanner";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Numeric } from "@/components/numeric/Numeric";
import { formatRelativeTime } from "@/shared/lib/format";
import { MessageBubble } from "@/components/support/MessageBubble";
import { ReplyComposer } from "@/components/support/ReplyComposer";

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("support");
  const tDetail = useTranslations("userDetail");
  const tTicket = useTranslations("supportTicket");
  const ticket = useTicket(params.id);
  const replies = useTicketReplies(params.id);
  const data = ticket.data;

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("queue")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="grow">
                  <h2 className="text-base font-medium">{data.subject}</h2>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] _num">{data.userEmail}</p>
                </div>
                <TicketStatusBadge status={data.status} />
              </CardHeader>
              <CardBody>
                <div className="mb-3 flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>{tTicket("opened")} <Numeric value={formatRelativeTime(data.createdAt)} /></span>
                  <span>{tTicket("updated")} <Numeric value={formatRelativeTime(data.updatedAt)} /></span>
                </div>
                <div className="space-y-3">
                  <MessageBubble
                    reply={{
                      id: "origin",
                      author: data.userEmail,
                      role: "user",
                      message: data.description,
                      createdAt: data.createdAt,
                    }}
                  />
                  {(replies.data ?? []).map((r) => (
                    <MessageBubble key={r.id} reply={r} />
                  ))}
                </div>
                <p className="mt-4 text-xs text-[var(--text-secondary)]">{t("ticket.privacyNotice")}</p>
              </CardBody>
            </Card>
            <ReplyComposer ticketId={data.id} userEmail={data.userEmail} />
          </div>
          <div className="space-y-4">
            {data.hasAttachment && data.attachmentExpiresAt && (
              <AttachmentBanner expiresAt={data.attachmentExpiresAt} />
            )}
            <Card>
              <CardHeader>
                <h3 className="text-base font-medium">{tDetail("ticketHistory")}</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-[var(--text-secondary)]">
                  {tTicket("metadataOnly")}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}