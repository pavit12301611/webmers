import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getOrder, markOrderPaid } from '@/lib/data';
import { isTrustedMutation, mutationDeniedResponse, noStore } from '@/lib/security';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isTrustedMutation(request)) return mutationDeniedResponse();
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') return noStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  const order = await getOrder(params.id);
  if (!order || order.status !== 'PENDING') return noStore(NextResponse.json({ error: 'Pending order not found.' }, { status: 404 }));
  await markOrderPaid(order.id, `manual_admin_${Date.now()}`);
  return noStore(NextResponse.json({ ok: true }));
}
