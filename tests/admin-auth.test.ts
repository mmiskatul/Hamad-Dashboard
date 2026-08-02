import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieValues = new Map<string, string>();
const set = vi.fn((name: string, value: string) => cookieValues.set(name, value));
const remove = vi.fn((name: string) => cookieValues.delete(name));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value ? { name, value } : undefined;
    },
    set,
    delete: remove,
  }),
}));

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  getSession,
  refreshAdminSession,
  setSession,
  type AdminCredentials,
} from "@/shared/lib/auth";

const credentials: AdminCredentials = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    name: "Platform Admin",
    role: "admin",
    createdAt: "2026-08-02T00:00:00.000Z",
  },
  accessToken: accessToken(),
  refreshToken: "rt_test_refresh_token_with_sufficient_length",
  sessionToken: "st_test_session_token_with_sufficient_length",
  tokenType: "Bearer",
  expiresIn: "15m",
  sessionExpiresAt: "2026-09-01T00:00:00.000Z",
};

describe("admin authentication cookies", () => {
  beforeEach(() => {
    cookieValues.clear();
    set.mockClear();
    remove.mockClear();
    vi.unstubAllGlobals();
  });

  it("stores access, refresh, and session credentials as HttpOnly cookies", async () => {
    await setSession(credentials);

    expect(set).toHaveBeenCalledTimes(3);
    expect(set).toHaveBeenCalledWith(
      ACCESS_COOKIE,
      credentials.accessToken,
      expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
    );
    expect(set).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      credentials.refreshToken,
      expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
    );
    expect(set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      credentials.sessionToken,
      expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
    );
  });

  it("restores the admin only after backend token and session validation", async () => {
    cookieValues.set(ACCESS_COOKIE, credentials.accessToken);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: credentials.user }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSession()).resolves.toEqual(credentials.user);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/admin/auth/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${credentials.accessToken}`,
        }),
      }),
    );
  });

  it("refreshes with both opaque cookies without exposing them to client code", async () => {
    cookieValues.set(REFRESH_COOKIE, credentials.refreshToken);
    cookieValues.set(SESSION_COOKIE, credentials.sessionToken);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(credentials), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(refreshAdminSession()).resolves.toEqual(credentials);
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toEqual({
      refreshToken: credentials.refreshToken,
      sessionToken: credentials.sessionToken,
    });
  });
});

function accessToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 900 }),
  ).toString("base64url");
  return `header.${payload}.signature`;
}
