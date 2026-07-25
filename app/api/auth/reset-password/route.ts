import { NextResponse } from 'next/server';
import { verifyAndResetPassword } from '@/lib/data';
import { clearRateLimit, clientIp, rateLimit, tooManyRequests } from '@/lib/rateLimit';
import {
  isValidEmail,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  readJsonBody,
  readString,
  validatePassword,
} from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    // A 6-digit code is only safe when guesses are strictly limited.
    const ipLimit = rateLimit(`reset:${ip}`, { limit: 10, windowMs: 15 * 60_000 });
    if (!ipLimit.ok) {
      return tooManyRequests(ipLimit.retryAfter, 'Too many attempts. Please try again later.');
    }

    const body = await readJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const email = readString(body.email, MAX_EMAIL_LENGTH);
    const otp = readString(body.otp, 6);
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Please enter the 6-digit code.' }, { status: 400 });
    }
    if (newPassword.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters.` },
        { status: 400 },
      );
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.ok) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
    }

    const addressKey = `reset:addr:${email.toLowerCase()}`;
    const addressLimit = rateLimit(addressKey, { limit: 5, windowMs: 15 * 60_000 });
    if (!addressLimit.ok) {
      return tooManyRequests(
        addressLimit.retryAfter,
        'Too many attempts for this account. Please request a new code.',
      );
    }

    const result = await verifyAndResetPassword(email, otp, newPassword);

    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Failed to reset password.' }, { status: 400 });
    }

    // Successful reset clears the throttle for this address.
    clearRateLimit(addressKey);

    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
