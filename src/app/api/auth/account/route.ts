import { NextResponse } from "next/server";
import { getAdminAccountAuth } from "@/shared/lib/auth";

export async function GET() {
  try {
    return NextResponse.json(await getAdminAccountAuth());
  } catch {
    return NextResponse.json(
      { error: { message: "Your administrator session is no longer valid." } },
      { status: 401 },
    );
  }
}
