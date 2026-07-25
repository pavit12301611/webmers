import { NextResponse } from 'next/server';
import { subscribeNewsletter } from '@/lib/data';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { MAX_EMAIL_LENGTH, readJsonBody, readString } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`newsletter:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter, 'Too many requests. Please try again later.');
    }

    const body = await readJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const email = readString(body.email, MAX_EMAIL_LENGTH);
    const result = await subscribeNewsletter(email);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: result.alreadySubscribed
        ? "You're already on the list!"
        : "You're on the list!",
    });
  } catch (err) {
    console.error('Newsletter error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
