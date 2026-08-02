import { cookies } from "next/headers";

export const ACCESS_COOKIE = process.env.ADMIN_ACCESS_COOKIE ?? "admin_access";
export const REFRESH_COOKIE = process.env.ADMIN_REFRESH_COOKIE ?? "admin_refresh";
export const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE ?? "admin_session";
export const LOCALE_COOKIE = "admin_locale";
export const THEME_COOKIE = "admin_theme";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin";
  createdAt: string;
};

export type AdminCredentials = {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
  sessionToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  sessionExpiresAt: string;
};

export type AdminSessionRecord = {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  current: boolean;
  userAgent?: string;
  ipAddress?: string;
};

export class AdminAuthenticationError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "ADMIN_AUTHENTICATION_FAILED",
  ) {
    super(message);
    this.name = "AdminAuthenticationError";
  }
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminCredentials> {
  return backendJson<AdminCredentials>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshAdminSession(): Promise<AdminCredentials> {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  const sessionToken = store.get(SESSION_COOKIE)?.value;
  if (!refreshToken || !sessionToken) {
    throw new AdminAuthenticationError("Your admin session has expired.", 401);
  }
  return backendJson<AdminCredentials>("/admin/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken, sessionToken }),
  });
}

export async function getSession(): Promise<AdminUser | null> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;
  try {
    const response = await backendJson<{ user: AdminUser }>("/admin/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.user;
  } catch (error) {
    if (error instanceof AdminAuthenticationError && [401, 403].includes(error.status)) {
      return null;
    }
    return null;
  }
}

export async function getAdminAccountAuth(): Promise<{
  user: AdminUser;
  sessions: AdminSessionRecord[];
}> {
  const me = await authorizedBackendJson<{ user: AdminUser }>("/admin/auth/me");
  const active = await authorizedBackendJson<{ sessions: AdminSessionRecord[] }>(
    "/admin/auth/sessions",
  );
  return { user: me.user, sessions: active.sessions };
}

export async function revokeAdminSession(sessionId: string): Promise<void> {
  await authorizedBackendJson<void>(
    `/admin/auth/sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
  );
}

export async function revokeOtherAdminSessions(): Promise<number> {
  const result = await authorizedBackendJson<{ revoked: number }>(
    "/admin/auth/sessions/revoke-others",
    { method: "POST" },
  );
  return result.revoked;
}

export async function setSession(credentials: AdminCredentials): Promise<void> {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const sessionExpires = new Date(credentials.sessionExpiresAt);
  const common = {
    httpOnly: true,
    secure,
    sameSite: "strict" as const,
    path: "/",
    priority: "high" as const,
  };

  store.set(ACCESS_COOKIE, credentials.accessToken, {
    ...common,
    expires: accessTokenExpiry(credentials.accessToken),
  });
  store.set(REFRESH_COOKIE, credentials.refreshToken, {
    ...common,
    expires: sessionExpires,
  });
  store.set(SESSION_COOKIE, credentials.sessionToken, {
    ...common,
    expires: sessionExpires,
  });
}

export async function logoutAdminSession(): Promise<void> {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    try {
      await backendJson<void>("/admin/auth/logout", {
        method: "POST",
        body: JSON.stringify({ sessionToken }),
      });
    } catch {
      // Local cookie removal still signs the browser out if the backend is unavailable.
    }
  }
  clearSessionCookies(store);
}

export async function clearSession(): Promise<void> {
  clearSessionCookies(await cookies());
}

function clearSessionCookies(store: Awaited<ReturnType<typeof cookies>>): void {
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(SESSION_COOKIE);
}

function accessTokenExpiry(token: string): Date {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as { exp?: number };
    if (typeof payload.exp === "number") return new Date(payload.exp * 1000);
  } catch {
    // The backend remains the authority; this only controls browser expiry.
  }
  return new Date(Date.now() + 15 * 60 * 1000);
}

async function backendJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { code?: string; message?: string } }
      | null;
    throw new AdminAuthenticationError(
      body?.error?.message ?? "Unable to authenticate with the backend.",
      response.status,
      body?.error?.code,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function authorizedBackendJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const store = await cookies();
  let accessToken = store.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    const refreshed = await refreshAdminSession();
    await setSession(refreshed);
    accessToken = refreshed.accessToken;
  }
  try {
    return await backendJson<T>(path, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    if (!(error instanceof AdminAuthenticationError) || error.status !== 401) {
      throw error;
    }
    const refreshed = await refreshAdminSession();
    await setSession(refreshed);
    return backendJson<T>(path, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${refreshed.accessToken}`,
      },
    });
  }
}

function backendBaseUrl(): string {
  return (
    process.env.BACKEND_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:4000/api/v1"
  ).replace(/\/$/, "");
}
