import { NextResponse } from 'next/server';
import { subscribeNewsletter } from '@/lib/data';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email : '';
  const result = await subscribeNewsletter(email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: "You're on the list!" });
}
