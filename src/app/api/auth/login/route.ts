import { NextResponse } from "next/server";
import {
  AdminAuthenticationError,
  loginAdmin,
  setSession,
} from "@/shared/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: { message: "Email and password are required." } },
        { status: 400 },
      );
    }
    const credentials = await loginAdmin(body.email, body.password);
    await setSession(credentials);
    return NextResponse.json({ user: credentials.user });
  } catch (error) {
    const status = error instanceof AdminAuthenticationError ? error.status : 502;
    const message =
      error instanceof AdminAuthenticationError
        ? error.message
        : "The authentication service is unavailable.";
    return NextResponse.json({ error: { message } }, { status });
  }
}
