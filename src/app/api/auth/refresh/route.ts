import { NextRequest, NextResponse } from "next/server";
import {
  clearSession,
  refreshAdminSession,
  setSession,
} from "@/shared/lib/auth";

export async function GET(request: NextRequest) {
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get("returnTo"));
  try {
    const credentials = await refreshAdminSession();
    await setSession(credentials);
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch {
    await clearSession();
    const locale = returnTo.split("/").filter(Boolean)[0] === "ar" ? "ar" : "en";
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
}

function safeReturnPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/en/admin";
  return value;
}
