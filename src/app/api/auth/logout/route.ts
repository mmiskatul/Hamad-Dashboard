import { logoutAdminSession } from "@/shared/lib/auth";

export async function POST() {
  await logoutAdminSession();
  return new Response(null, { status: 204 });
}
