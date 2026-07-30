import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, isValidEmail, type Role } from '@/lib/data';
import { isTrustedMutation, mutationDeniedResponse, noStore, rateLimit, rateLimitResponse } from '@/lib/security';

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

export async function POST(req: Request) {
  try {
    if (!isTrustedMutation(req)) return mutationDeniedResponse();
    const limit = rateLimit(req, 'signup', 5, 15 * 60_000);
    if (!limit.allowed) return rateLimitResponse(limit.resetAt);

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    const role: Role = body?.role === 'SELLER' ? 'SELLER' : 'BUYER';

    if (!email || !password || !name) {
      return noStore(NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 }));
    }
    if (name.length > MAX_NAME_LENGTH || email.length > MAX_EMAIL_LENGTH || !isValidEmail(email)) {
      return noStore(NextResponse.json({ error: 'Please enter a valid name and email address.' }, { status: 400 }));
    }
    // Require a reasonable baseline without imposing arbitrary special-character rules.
    if (password.length < 12 || password.length > 128) {
      return noStore(NextResponse.json({ error: 'Password must be between 12 and 128 characters.' }, { status: 400 }));
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return noStore(NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 }));
    }

    const user = await createUser({ email, name, password, role });
    return noStore(NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201 },
    ));
  } catch (err) {
    console.error('Signup error:', err);
    return noStore(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}
