import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/auth/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { listingId, amount, layoutChoice, codeUnlocked } = await req.json();

    if (!listingId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        listingId,
        amount: parseFloat(amount),
        layoutChoice: layoutChoice || 'Hero-Centered',
        codeUnlocked: !!codeUnlocked,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      status: 'PENDING',
      message: 'Order created. Funds held in escrow.',
    }, { status: 201 });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
