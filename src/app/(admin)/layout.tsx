import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getSession } from "@/shared/lib/auth";
import { getLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    const locale = (await getLocale()) ?? "en";
    redirect(`/${locale}/login`);
  }
  return <AppShell>{children}</AppShell>;
}