import { revokeAdminSession } from "@/shared/lib/auth";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    await revokeAdminSession(sessionId);
    return new Response(null, { status: 204 });
  } catch {
    return Response.json(
      { error: { message: "Unable to revoke the administrator session." } },
      { status: 400 },
    );
  }
}
