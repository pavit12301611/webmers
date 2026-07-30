import { NextResponse } from 'next/server';
import { isValidEmail, requestPasswordReset } from '@/lib/data';
import { sendPasswordResetEmail } from '@/lib/email';
import { isTrustedMutation, mutationDeniedResponse, noStore, rateLimit, rateLimitResponse } from '@/lib/security';

export async function POST(req: Request) {
  try {
    if (!isTrustedMutation(req)) return mutationDeniedResponse();
    const limit = rateLimit(req, 'password-reset-request', 3, 15 * 60_000);
    if (!limit.allowed) return rateLimitResponse(limit.resetAt);

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || email.length > 254 || !isValidEmail(email)) {
      return noStore(NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 }));
    }

    const result = await requestPasswordReset(email);
    // Keep this response identical for known and unknown accounts.
    if (result.ok && result.otp) await sendPasswordResetEmail(email, result.otp);

    return noStore(NextResponse.json({
      ok: true,
      message: 'If an account exists with that email, a reset code has been sent.',
    }));
  } catch (err) {
    console.error('Forgot password error:', err);
    return noStore(NextResponse.json({ error: 'Something went wrong.' }, { status: 500 }));
  }
}
