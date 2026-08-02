import { revokeOtherAdminSessions } from "@/shared/lib/auth";

export async function POST() {
  try {
    return Response.json({ revoked: await revokeOtherAdminSessions() });
  } catch {
    return Response.json(
      { error: { message: "Unable to revoke the other administrator sessions." } },
      { status: 400 },
    );
  }
}
