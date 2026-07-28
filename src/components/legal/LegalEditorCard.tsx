"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { MarkdownView } from "@/components/editor/MarkdownView";
import { Numeric } from "@/components/numeric/Numeric";
import type { LegalDoc } from "@/shared/api/types";
import { useSaveLegalVersion } from "@/shared/api/queries";

export function LegalEditorCard({
  docType,
  doc,
  onSaved,
}: {
  docType: "terms" | "privacy";
  doc: LegalDoc;
  onSaved?: () => void;
}) {
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");
  const current = doc.versions.find((v) => v.id === doc.currentVersionId);

  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(current?.bodyMarkdown ?? "");
  const [summary, setSummary] = useState("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");

  const save = useSaveLegalVersion(docType);
  const validReason = reason.trim().length >= 10;

  // Reset the buffer whenever the current version body changes (e.g. after save
  // or a restore), but only while we're not in the middle of editing. This
  // keeps "Cancel" honest: discard edits and re-show the live version.
  useEffect(() => {
    if (!isEditing) setBody(current?.bodyMarkdown ?? "");
  }, [current?.bodyMarkdown, isEditing]);

  const startEditing = () => {
    setBody(current?.bodyMarkdown ?? "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setBody(current?.bodyMarkdown ?? "");
    setSummary("");
    setReason("");
    setReasonOpen(false);
    setIsEditing(false);
  };

  const onSave = async () => {
    if (!validReason || !body.trim()) return;
    await save.mutateAsync({ body, summary, createdBy: "admin@oneai.app", reason });
    toast.success(tToast("legalPublished"));
    setReasonOpen(false);
    setReason("");
    setSummary("");
    setIsEditing(false);
    onSaved?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <h2 className="text-base font-medium">{isEditing ? t("editor") : t("view")}</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {t("currentVersion")}: <Numeric value={doc.currentVersionId} />
          </p>
        </div>
        {!isEditing ? (
          <Button variant="primary" onClick={startEditing}>
            {t("edit")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={cancelEditing}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={() => setReasonOpen(true)} disabled={!body.trim()}>
              {tCommon("save")}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardBody className="space-y-4">
        {isEditing ? (
          <MarkdownEditor value={body} onChange={setBody} />
        ) : (
          <MarkdownView source={current?.bodyMarkdown ?? ""} ariaLabel={t("view")} />
        )}
      </CardBody>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent ariaLabel={t("saveNewVersion")}>
          <div className="space-y-3">
            <DialogHeader>
              <DialogTitle>{t("saveNewVersion")}</DialogTitle>
            </DialogHeader>
            <div>
              <Label htmlFor={`legal-summary-${docType}`}>{t("summaryPlaceholder")}</Label>
              <Input
                id={`legal-summary-${docType}`}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="mt-2"
                placeholder={t("summaryPlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor={`legal-reason-${docType}`}>{t("reasonRequired")}</Label>
              <Textarea
                id={`legal-reason-${docType}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
                placeholder={t("reasonRequired")}
              />
              {!validReason && reason.length > 0 && (
                <p className="mt-1 text-xs text-[var(--danger-text)]">
                  <Numeric value={10} /> characters minimum.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReasonOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="primary"
              disabled={!validReason || !body.trim() || save.isPending}
              onClick={onSave}
            >
              {t("saveNewVersion")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}