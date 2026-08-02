import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function LoginVerifyPage() {
  const locale = (await getLocale()) ?? "en";
  redirect(`/${locale}/login`);
}
