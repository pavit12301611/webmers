import { NextResponse } from 'next/server';
import { subscribeNewsletter } from '@/lib/data';
import { isTrustedMutation, mutationDeniedResponse, noStore, rateLimit, rateLimitResponse } from '@/lib/security';

export async function POST(req: Request) {
  if (!isTrustedMutation(req)) return mutationDeniedResponse();
  const limit = rateLimit(req, 'newsletter', 5, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email : '';
  const result = await subscribeNewsletter(email);
  if (!result.ok) {
    return noStore(NextResponse.json({ error: result.error }, { status: 400 }));
  }
  return noStore(NextResponse.json({ ok: true, message: "You're on the list!" }));
}
