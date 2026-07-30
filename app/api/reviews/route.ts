import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { createReview } from '@/lib/data';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { listingId, rating, comment } = await req.json();

  if (!listingId || !rating || !comment) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const review = await createReview({
      buyerId: session.user.id,
      listingId,
      rating: Number(rating),
      comment,
    });
    return NextResponse.json({ success: true, review });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
