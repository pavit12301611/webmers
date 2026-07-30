import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getReviews } from '@/lib/data';

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { reviewId } = await req.json().catch(() => ({}));
  if (!reviewId) return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
  return NextResponse.json({ ok: true, message: `Review ${reviewId} removed (demo)` });
}
