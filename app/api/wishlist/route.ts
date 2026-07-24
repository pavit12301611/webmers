import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getListing, getWishlist, toggleWishlist } from '@/lib/data';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const listings = await getWishlist(session.user.id);
  return NextResponse.json({ listings });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'You must be signed in to save websites.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const listingId = typeof body?.listingId === 'string' ? body.listingId : '';
  if (!listingId) {
    return NextResponse.json({ error: 'A listing is required.' }, { status: 400 });
  }

  const listing = await getListing(listingId);
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }

  const { wishlisted } = await toggleWishlist(session.user.id, listingId);
  return NextResponse.json({ wishlisted });
}
