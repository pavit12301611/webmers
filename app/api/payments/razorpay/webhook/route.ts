import { NextResponse } from 'next/server';
import { getOrderByPaymentReference, markOrderPaid } from '@/lib/data';
import { verifyWebhookSignature } from '@/lib/razorpay';

export const runtime = 'nodejs';

/**
 * Razorpay should be configured to send payment.captured events here. The
 * signature is checked against the raw request body before any data is used.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }
  try {
    const event = JSON.parse(rawBody);
    if (event.event !== 'payment.captured') return NextResponse.json({ ok: true });
    const payment = event.payload?.payment?.entity;
    const gatewayOrderId = typeof payment?.order_id === 'string' ? payment.order_id : '';
    const paymentId = typeof payment?.id === 'string' ? payment.id : '';
    if (!gatewayOrderId || !paymentId) return NextResponse.json({ error: 'Invalid payment payload.' }, { status: 400 });
    const order = await getOrderByPaymentReference(gatewayOrderId);
    if (order && payment.amount === Math.round(order.amount * 100) && payment.currency === 'INR') {
      await markOrderPaid(order.id, paymentId);
    }
    // Acknowledge unknown valid events to avoid repeated deliveries; alert via platform monitoring.
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
