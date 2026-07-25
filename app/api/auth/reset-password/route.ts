import { NextResponse } from 'next/server';
import { isValidEmail, verifyAndResetPassword } from '@/lib/data';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const otp = typeof body?.otp === 'string' ? body.otp.trim() : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
    }
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'Please enter the 6-digit code.' }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const result = await verifyAndResetPassword(email, otp, newPassword);

    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Failed to reset password.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
