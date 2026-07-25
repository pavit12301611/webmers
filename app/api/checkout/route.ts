import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { CODE_UNLOCK_PRICE, createOrder, getListing, hasPurchased } from '@/lib/data';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { isLayoutChoice, readJsonBody } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in to check out.' }, { status: 401 });
    }

    // Throttle per account: guards against double-click duplicates and abuse.
    const limit = rateLimit(`checkout:${session.user.id}`, { limit: 10, windowMs: 60_000 });
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter, 'Too many checkout attempts. Please wait a moment.');
    }

    const body = await readJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const listingId = typeof body.listingId === 'string' ? body.listingId : '';
    const codeUnlocked = body.codeUnlocked === true;

    if (!listingId) {
      return NextResponse.json({ error: 'A listing is required.' }, { status: 400 });
    }

    // Only the three offered variants are accepted — never a free-form string.
    const layoutChoice = isLayoutChoice(body.layoutChoice) ? body.layoutChoice : 'Hero-Centered';
    if (body.layoutChoice !== undefined && !isLayoutChoice(body.layoutChoice)) {
      return NextResponse.json({ error: 'Invalid layout selection.' }, { status: 400 });
    }

    const listing = await getListing(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    // A seller buying their own listing would inflate its sales and ranking.
    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot purchase your own listing.' },
        { status: 400 },
      );
    }

    // Block accidental double purchases of something already owned.
    if (await hasPurchased(session.user.id, listingId)) {
      return NextResponse.json(
        { error: 'You already own this website. Check your dashboard to open it.' },
        { status: 409 },
      );
    }

    // Compute the amount server-side so it can never be tampered with.
    const amount = listing.price + (codeUnlocked ? CODE_UNLOCK_PRICE : 0);

    const order = await createOrder({
      buyerId: session.user.id,
      listingId,
      amount,
      layoutChoice,
      codeUnlocked,
    });

    return NextResponse.json(
      {
        orderId: order.id,
        status: order.status,
        amount: order.amount,
        message: 'Order recorded. Funds are held in escrow for 72 hours.',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
