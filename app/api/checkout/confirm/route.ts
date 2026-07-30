import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getOrder, markOrderPaid } from '@/lib/data';

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

  // Mark as completed (release escrow)
  const updated = await markOrderPaid(orderId, order.paymentId || 'manual');
  if (updated) {
    // In real app we would also update status to COMPLETED
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Failed' }, { status: 400 });
}
