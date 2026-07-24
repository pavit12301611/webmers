import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/auth/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, name, role = 'BUYER' } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role === 'SELLER' ? 'SELLER' : 'BUYER',
        passwordHash,
      },
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
