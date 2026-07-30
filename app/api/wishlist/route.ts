import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getListing, getWishlist, toggleWishlist } from '@/lib/data';
import { isTrustedMutation, mutationDeniedResponse, noStore, rateLimit, rateLimitResponse } from '@/lib/security';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return noStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  return noStore(NextResponse.json({ listings: await getWishlist(session.user.id) }));
}

export async function POST(req: Request) {
  if (!isTrustedMutation(req)) return mutationDeniedResponse();
  const limit = rateLimit(req, 'wishlist', 30, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return noStore(NextResponse.json({ error: 'You must be signed in to save websites.' }, { status: 401 }));

  const body = await req.json().catch(() => null);
  const listingId = typeof body?.listingId === 'string' ? body.listingId : '';
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(listingId)) {
    return noStore(NextResponse.json({ error: 'A valid listing is required.' }, { status: 400 }));
  }
  if (!await getListing(listingId)) return noStore(NextResponse.json({ error: 'Listing not found.' }, { status: 404 }));

  return noStore(NextResponse.json(await toggleWishlist(session.user.id, listingId)));
}
