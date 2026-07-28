"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { AppText } from "@/shared/ui/AppText";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const t = useTranslations("account.form");
  const ts = useTranslations("toast");
  const [n, setN] = useState(name);
  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <AppText role="card">{t("name")}</AppText>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <div>
          <Label htmlFor="acc-name">{t("name")}</Label>
          <Input id="acc-name" value={n} onChange={(ev) => setN(ev.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="acc-email">{t("email")}</Label>
          <div className="relative mt-2">
            <Input
              id="acc-email"
              value={email}
              readOnly
              aria-readonly="true"
              className="pe-10"
            />
            <Lock
              size={14}
              aria-hidden
              className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => toast.success(ts("saved"), { description: ts("savedDetail") })}
          >
            {ts("saved")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}