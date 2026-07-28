/**
 * Mocked email sender. Resolves after a simulated 200ms round-trip and
 * returns a fake message id. No real network call is made.
 *
 * The single super-admin audit log records every send. Toast confirmation
 * lives with the caller — this function intentionally stays silent so it
 * can be unit-tested without a Toaster context.
 */

export type SendMailPayload = {
  to: string;
  subject: string;
  message: string;
};

export type SendMailResult = {
  id: string;
  deliveredAt: string;
};

export async function sendMail(payload: SendMailPayload): Promise<SendMailResult> {
  // Simulated network round-trip.
  await new Promise((resolve) => setTimeout(resolve, 200));
  const id = `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  if (typeof console !== "undefined") {
    console.info("[email:mock] sent", {
      id,
      to: payload.to,
      subject: payload.subject,
      bytes: payload.message.length,
    });
  }
  return { id, deliveredAt: new Date().toISOString() };
}