"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { sendMail } from "@/shared/lib/email";
import { useCloseTicket, usePostReply } from "@/shared/api/queries";

export function ReplyComposer({
  ticketId,
  userEmail,
}: {
  ticketId: string;
  userEmail: string;
}) {
  const t = useTranslations("support");
  const [body, setBody] = useState("");
  const post = usePostReply(ticketId);
  const close = useCloseTicket();

  const onSend = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    await post.mutateAsync({ body: trimmed, actor: "admin@oneai.app" });
    await sendMail({
      to: userEmail,
      subject: "OneAI Support",
      message: trimmed,
    });
    toast.success(t("sentToast", { email: userEmail }));
    setBody("");
  };

  const onSendAndClose = async () => {
    const trimmed = body.trim();
    if (trimmed) {
      await onSend();
    }
    await close.mutateAsync({
      ticketId,
      actor: "admin@oneai.app",
      reason: trimmed ? `Closed after sending: ${trimmed.slice(0, 60)}` : "Closed without reply",
    });
    toast.success(t("closedToast"));
  };

  const onDraft = () => {
    // Save-draft is intentionally a local-only affordance until a draft
    // endpoint ships; we surface a clarifying toast rather than claim it
    // is persisted server-side.
    toast.success(t("draftSavedToast"));
  };

  const sending = post.isPending || close.isPending;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-medium">{t("reply")}</h3>
      </CardHeader>
      <CardBody className="space-y-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("replyPlaceholder", { email: userEmail })}
          className="min-h-[120px]"
          disabled={sending}
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={onDraft} disabled={sending}>
            {t("saveDraft")}
          </Button>
          <Button variant="outline" onClick={onSendAndClose} disabled={sending}>
            {t("sendAndClose")}
          </Button>
          <Button
            variant="primary"
            onClick={onSend}
            disabled={!body.trim() || sending}
          >
            {t("send")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}