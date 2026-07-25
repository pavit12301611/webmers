import { NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/data';
import { sendPasswordResetEmail } from '@/lib/email';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { isValidEmail, MAX_EMAIL_LENGTH, readJsonBody, readString } from '@/lib/validation';

const GENERIC_MESSAGE = 'If an account exists with that email, a reset code has been sent.';

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const ipLimit = rateLimit(`forgot:${ip}`, { limit: 5, windowMs: 15 * 60_000 });
    if (!ipLimit.ok) {
      return tooManyRequests(ipLimit.retryAfter, 'Too many reset requests. Please try again later.');
    }

    const body = await readJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const email = readString(body.email, MAX_EMAIL_LENGTH);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Also cap per-address so one account cannot be spammed from many IPs.
    const emailLimit = rateLimit(`forgot:addr:${email.toLowerCase()}`, {
      limit: 3,
      windowMs: 15 * 60_000,
    });
    if (!emailLimit.ok) {
      // Keep the response shape generic to avoid confirming the account exists.
      return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
    }

    const result = await requestPasswordReset(email);

    if (result.ok && result.otp) {
      const sendResult = await sendPasswordResetEmail(email, result.otp);

      // Previously the send result was ignored and the UI advanced to the
      // "enter your code" step even when delivery had failed, stranding the
      // user. Surface the failure honestly instead.
      if (!sendResult.ok) {
        return NextResponse.json(
          { error: 'We could not send the reset email right now. Please try again shortly.' },
          { status: 503 },
        );
      }

      return NextResponse.json({
        ok: true,
        message: GENERIC_MESSAGE,
        // Ethereal preview links expose the code, so they are development-only.
        previewUrl: process.env.NODE_ENV === 'production' ? undefined : sendResult.previewUrl,
      });
    }

    // No account: respond identically so the endpoint cannot enumerate users.
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
