import { NextResponse } from 'next/server';
import { isValidEmail, verifyAndResetPassword } from '@/lib/data';
import { isTrustedMutation, mutationDeniedResponse, noStore, rateLimit, rateLimitResponse } from '@/lib/security';

export async function POST(req: Request) {
  try {
    if (!isTrustedMutation(req)) return mutationDeniedResponse();
    const limit = rateLimit(req, 'password-reset-confirm', 5, 15 * 60_000);
    if (!limit.allowed) return rateLimitResponse(limit.resetAt);

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const otp = typeof body?.otp === 'string' ? body.otp.trim() : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!email || email.length > 254 || !isValidEmail(email)) {
      return noStore(NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 }));
    }
    if (!/^\d{6}$/.test(otp)) {
      return noStore(NextResponse.json({ error: 'Please enter the 6-digit code.' }, { status: 400 }));
    }
    if (newPassword.length < 12 || newPassword.length > 128) {
      return noStore(NextResponse.json({ error: 'Password must be between 12 and 128 characters.' }, { status: 400 }));
    }

    const result = await verifyAndResetPassword(email, otp, newPassword);
    if (!result.ok) return noStore(NextResponse.json({ error: result.error || 'Failed to reset password.' }, { status: 400 }));
    return noStore(NextResponse.json({ ok: true, message: 'Password updated successfully.' }));
  } catch (err) {
    console.error('Reset password error:', err);
    return noStore(NextResponse.json({ error: 'Something went wrong.' }, { status: 500 }));
  }
}
