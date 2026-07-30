import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getOrder, markOrderPaid, completeOrder } from '@/lib/data';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await req.json();
  const order = await getOrder(orderId);

  if (!order || order.buyerId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Mark order as paid and completed (release escrow)
  const updated = await markOrderPaid(orderId, order.paymentId || 'manual');
  if (updated) {
    await completeOrder(orderId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Failed' }, { status: 400 });
}
