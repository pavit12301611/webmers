import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getListing, getWishlist, toggleWishlist } from '@/lib/data';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { readJsonBody } from '@/lib/validation';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const listings = await getWishlist(session.user.id);
  return NextResponse.json({ listings });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in to save websites.' }, { status: 401 });
    }

    const limit = rateLimit(`wishlist:${session.user.id}`, { limit: 60, windowMs: 60_000 });
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter, 'Too many requests. Please slow down.');
    }

    const body = await readJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const listingId = typeof body.listingId === 'string' ? body.listingId : '';
    if (!listingId) {
      return NextResponse.json({ error: 'A listing is required.' }, { status: 400 });
    }

    const listing = await getListing(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    const { wishlisted } = await toggleWishlist(session.user.id, listingId);
    return NextResponse.json({ wishlisted });
  } catch (err) {
    console.error('Wishlist error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
