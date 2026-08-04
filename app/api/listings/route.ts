import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCategories, getListing, getListings } from '@/lib/data';

/**
 * Public marketplace API.
 *
 * GET /api/listings                 -> all active listings
 * GET /api/listings?category=SaaS   -> filter by category
 * GET /api/listings?search=blog     -> full-text-ish search
 * GET /api/listings?categories=1    -> also include category counts
 * GET /api/listings?id=meridian     -> single listing by id
 * GET /api/listings?listing=meridian alias for id
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const includeCategories = searchParams.get('categories') === '1';
  const id = searchParams.get('id') || searchParams.get('listing') || searchParams.get('listingId') || undefined;

  if (id) {
    const listing = await getListing(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found', id }, { status: 404 });
    }
    return NextResponse.json({ listing });
  }

  const listings = await getListings({ category, search });
  const payload: Record<string, unknown> = { listings, total: listings.length };
  if (includeCategories) payload.categories = await getCategories();

  return NextResponse.json(payload);
}
