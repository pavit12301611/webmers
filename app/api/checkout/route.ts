import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { CODE_UNLOCK_PRICE, createPendingOrder, getListing } from '@/lib/data';
import { getRazorpay, razorpayConfigured } from '@/lib/razorpay';
import { isTrustedMutation, mutationDeniedResponse, noStore, rateLimit, rateLimitResponse } from '@/lib/security';

const LAYOUTS = new Set(['Hero-Centered', 'Split-Screen', 'Video-Hero']);
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (!isTrustedMutation(req)) return mutationDeniedResponse();
    const limit = rateLimit(req, 'checkout', 10, 10 * 60_000);
    if (!limit.allowed) return rateLimitResponse(limit.resetAt);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return noStore(NextResponse.json({ error: 'You must be signed in to check out.' }, { status: 401 }));
    if (session.user.role === 'ADMIN') return noStore(NextResponse.json({ error: 'Admin accounts cannot make purchases.' }, { status: 403 }));
    if (!razorpayConfigured() || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      return noStore(NextResponse.json({ error: 'UPI payments are not configured yet. Please contact support.' }, { status: 503 }));
    }

    const body = await req.json().catch(() => null);
    const listingId = typeof body?.listingId === 'string' ? body.listingId : '';
    const layoutChoice = typeof body?.layoutChoice === 'string' ? body.layoutChoice : '';
    const codeUnlocked = body?.codeUnlocked === true;
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(listingId) || !LAYOUTS.has(layoutChoice)) return noStore(NextResponse.json({ error: 'Invalid checkout details.' }, { status: 400 }));

    const listing = await getListing(listingId);
    if (!listing || listing.status !== 'ACTIVE') return noStore(NextResponse.json({ error: 'Listing not found or unavailable.' }, { status: 404 }));
    if (listing.sellerId === session.user.id) return noStore(NextResponse.json({ error: 'You cannot purchase your own listing.' }, { status: 400 }));

    const amount = listing.price + (codeUnlocked ? CODE_UNLOCK_PRICE : 0);
    const gatewayOrder = await getRazorpay().orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `wm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, notes: { listingId, buyerId: session.user.id } });
    const order = await createPendingOrder({ buyerId: session.user.id, listingId, amount, layoutChoice, codeUnlocked, paymentProvider: 'RAZORPAY', paymentReference: gatewayOrder.id });

    return noStore(NextResponse.json({ orderId: order.id, gatewayOrderId: gatewayOrder.id, amount: Math.round(amount * 100), currency: 'INR', keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, name: 'Webmers', description: listing.title }, { status: 201 }));
  } catch (error) {
    console.error('Checkout error:', error);
    return noStore(NextResponse.json({ error: 'Unable to start payment. Please try again.' }, { status: 500 }));
  }
}
