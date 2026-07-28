"use client";
import { useTranslations } from "next-intl";
import { useAccount } from "@/shared/api/queries";
import { ProfileForm } from "@/features/account/ProfileForm";
import { TotpSettings } from "@/features/account/TotpSettings";
import { SessionList } from "@/features/account/SessionList";

export default function AccountPage() {
  const t = useTranslations("account");
  const account = useAccount();
  const data = account.data;
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>
      {data && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ProfileForm name={data.name} email={data.email} />
          <TotpSettings twoFactor={data.twoFactor} />
          <SessionList sessions={data.sessions} />
        </div>
      )}
    </div>
  );
}
