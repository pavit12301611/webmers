import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, type Role } from '@/lib/data';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rateLimit';
import {
  isValidEmail,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  readJsonBody,
  readString,
  validatePassword,
} from '@/lib/validation';

export async function POST(req: Request) {
  try {
    // Per-IP cap stops automated account flooding.
    const limit = rateLimit(`signup:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter, 'Too many sign-up attempts. Please try again later.');
    }

    const body = await readJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const email = readString(body.email, MAX_EMAIL_LENGTH);
    const name = readString(body.name, MAX_NAME_LENGTH);
    const password = typeof body.password === 'string' ? body.password : '';
    // Roles are allowlisted: ADMIN can never be self-assigned via signup.
    const role: Role = body.role === 'SELLER' ? 'SELLER' : 'BUYER';

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }
    if (name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters.` },
        { status: 400 },
      );
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.ok) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const user = await createUser({ email, name, password, role });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201 },
    );
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
