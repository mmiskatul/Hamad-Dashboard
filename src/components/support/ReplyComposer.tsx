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
  const tc = useTranslations("common");
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
    toast.success(t("draftSavedToast"));
  };

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
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={onDraft}>
            {t("saveDraft")}
          </Button>
          <Button variant="outline" onClick={onSendAndClose}>
            {t("sendAndClose")}
          </Button>
          <Button
            variant="primary"
            onClick={onSend}
            disabled={!body.trim() || post.isPending}
          >
            {t("send")}
          </Button>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)]">{tc("comingSoon")}: persistence layer is mocked.</p>
      </CardBody>
    </Card>
  );
}