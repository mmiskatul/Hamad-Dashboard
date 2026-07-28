import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
export const LOCALE_COOKIE = "admin_locale";
export const THEME_COOKIE = "admin_theme";

export type AdminSession = {
  email: string;
  issuedAt: string;
  expiresAt: string;
};

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as AdminSession;
  } catch {
    return null;
  }
}

export async function setSession(session: AdminSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(session)), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const DEMO_SESSION: AdminSession = {
  email: "admin@oneai.app",
  issuedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
};
