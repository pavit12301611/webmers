import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { CODE_UNLOCK_PRICE, createOrder, getListing } from '@/lib/data';
import { isTrustedMutation, mutationDeniedResponse, noStore, rateLimit, rateLimitResponse } from '@/lib/security';

const LAYOUTS = new Set(['Hero-Centered', 'Split-Screen', 'Video-Hero']);

export async function POST(req: Request) {
  try {
    if (!isTrustedMutation(req)) return mutationDeniedResponse();
    const limit = rateLimit(req, 'checkout', 10, 10 * 60_000);
    if (!limit.allowed) return rateLimitResponse(limit.resetAt);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return noStore(NextResponse.json({ error: 'You must be signed in to check out.' }, { status: 401 }));
    }
    if (session.user.role === 'ADMIN') {
      return noStore(NextResponse.json({ error: 'Admin accounts cannot make purchases.' }, { status: 403 }));
    }

    // Never mark an order paid in a live environment without a payment provider.
    // Set up Stripe/webhooks before enabling production payment collection.
    if (process.env.NODE_ENV === 'production' && process.env.PAYMENTS_DEMO_MODE !== 'true') {
      return noStore(NextResponse.json({ error: 'Checkout is being configured. Please contact support.' }, { status: 503 }));
    }

    const body = await req.json().catch(() => null);
    const listingId = typeof body?.listingId === 'string' ? body.listingId : '';
    const layoutChoice = typeof body?.layoutChoice === 'string' ? body.layoutChoice : '';
    const codeUnlocked = body?.codeUnlocked === true;

    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(listingId)) {
      return noStore(NextResponse.json({ error: 'A valid listing is required.' }, { status: 400 }));
    }
    if (!LAYOUTS.has(layoutChoice)) {
      return noStore(NextResponse.json({ error: 'Please choose a valid layout.' }, { status: 400 }));
    }

    const listing = await getListing(listingId);
    if (!listing || listing.status !== 'ACTIVE') {
      return noStore(NextResponse.json({ error: 'Listing not found or unavailable.' }, { status: 404 }));
    }
    if (listing.sellerId === session.user.id) {
      return noStore(NextResponse.json({ error: 'You cannot purchase your own listing.' }, { status: 400 }));
    }

    const amount = listing.price + (codeUnlocked ? CODE_UNLOCK_PRICE : 0);
    const order = await createOrder({ buyerId: session.user.id, listingId, amount, layoutChoice, codeUnlocked });

    return noStore(NextResponse.json(
      { orderId: order.id, status: order.status, amount: order.amount, message: 'Order confirmed. Funds are held in escrow for 72 hours.' },
      { status: 201 },
    ));
  } catch (err) {
    console.error('Checkout error:', err);
    return noStore(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}
