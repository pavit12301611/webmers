import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCategories, getListings } from '@/lib/data';

/**
 * Public marketplace API.
 *
 * GET /api/listings                 -> all active listings
 * GET /api/listings?category=SaaS   -> filter by category
 * GET /api/listings?search=blog     -> full-text-ish search
 * GET /api/listings?categories=1    -> also include category counts
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const includeCategories = searchParams.get('categories') === '1';

  const listings = await getListings({ category, search });
  const payload: Record<string, unknown> = { listings, total: listings.length };
  if (includeCategories) payload.categories = await getCategories();

  return NextResponse.json(payload);
}
