import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { CODE_UNLOCK_PRICE, createOrder, getListing } from '@/lib/data';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in to check out.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const listingId = typeof body?.listingId === 'string' ? body.listingId : '';
    const layoutChoice = typeof body?.layoutChoice === 'string' ? body.layoutChoice : 'Hero-Centered';
    const codeUnlocked = !!body?.codeUnlocked;

    if (!listingId) {
      return NextResponse.json({ error: 'A listing is required.' }, { status: 400 });
    }

    const listing = await getListing(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
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
        message: 'Payment successful. Funds held in escrow for 72 hours.',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
