import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getOrder, markOrderPaid } from '@/lib/data';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { isTrustedMutation, mutationDeniedResponse, noStore, rateLimit, rateLimitResponse } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) return mutationDeniedResponse();
  const limit = rateLimit(request, 'razorpay-verify', 10, 10 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return noStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
  const gatewayOrderId = typeof body?.razorpay_order_id === 'string' ? body.razorpay_order_id : '';
  const paymentId = typeof body?.razorpay_payment_id === 'string' ? body.razorpay_payment_id : '';
  const signature = typeof body?.razorpay_signature === 'string' ? body.razorpay_signature : '';
  const order = await getOrder(orderId);
  if (!order || order.buyerId !== session.user.id || order.paymentProvider !== 'RAZORPAY' || order.paymentReference !== gatewayOrderId) {
    return noStore(NextResponse.json({ error: 'Payment order was not found.' }, { status: 404 }));
  }
  if (!verifyRazorpaySignature(gatewayOrderId, paymentId, signature)) {
    return noStore(NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 }));
  }
  await markOrderPaid(order.id, paymentId);
  return noStore(NextResponse.json({ ok: true, orderId: order.id }));
}
