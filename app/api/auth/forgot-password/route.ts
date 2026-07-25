import { NextResponse } from 'next/server';
import { isValidEmail, requestPasswordReset } from '@/lib/data';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const result = await requestPasswordReset(email);

    let previewUrl: string | undefined;

    if (result.ok && result.otp) {
      const sendResult = await sendPasswordResetEmail(email, result.otp);
      previewUrl = sendResult.previewUrl;
    }

    // Always return success message for security (don't reveal if account exists).
    // Never leak the OTP back to the client — it is sent via email only.
    return NextResponse.json({
      ok: true,
      message: 'If an account exists with that email, a reset code has been sent.',
      ...(previewUrl ? { previewUrl } : {}),
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
