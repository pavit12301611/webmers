import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { CheckCircle, Download, PenTool, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { escrowStatus, getOrder } from '@/lib/data';

export const metadata: Metadata = { title: 'Purchase Confirmed' };

export default async function CheckoutConfirmation({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  // This page shows purchase details, so it requires a session.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const target = searchParams.order
      ? `/checkout/confirmation?order=${encodeURIComponent(searchParams.order)}`
      : '/checkout/confirmation';
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(target)}`);
  }

  if (!searchParams.order) notFound();

  const order = await getOrder(searchParams.order);

  // Ownership check: an order may only be viewed by the buyer who placed it
  // (admins may inspect any order). Without this, order IDs are enumerable and
  // anyone could read another customer's purchase.
  const isOwner = order?.buyerId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!order || (!isOwner && !isAdmin)) notFound();

  const escrow = escrowStatus(order);

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="flex min-h-screen items-center justify-center px-6 py-28">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
            <CheckCircle size={40} className="text-black" />
          </div>
          <h1
            className="mb-4 text-4xl tracking-tight md:text-6xl"
            style={{ fontFamily: 'var(--font-instrument)' }}
          >
            Purchase Confirmed
          </h1>
          <p className="mb-8 text-xl text-white/40">
            {order.listingTitle} is being delivered to your account.
          </p>

          <div className="mb-8 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6 text-left">
            <h2 className="mb-4 font-semibold">Order Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/40">Order ID</dt>
                <dd className="font-mono text-xs text-white/70">{order.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/40">Website</dt>
                <dd className="font-medium">{order.listingTitle}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/40">Layout</dt>
                <dd>{order.layoutChoice}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/40">Code Unlock</dt>
                <dd>{order.codeUnlocked ? 'Included' : 'Not included'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/40">Status</dt>
                <dd className="text-emerald-300">
                  {escrow.inEscrow ? 'Paid (in escrow)' : order.status}
                </dd>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">${order.amount.toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <Link
              href={`/editor?order=${encodeURIComponent(order.id)}`}
              className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-6 text-center transition-all hover:border-white/20"
            >
              <PenTool className="mx-auto mb-2 text-white/70" size={22} />
              <h3 className="mb-1 font-semibold">Open Editor</h3>
              <span className="text-xs text-white/30">Modify your site instantly</span>
            </Link>
            <Link
              href="/dashboard/buyer"
              className="rounded-3xl border border-amber-400/20 bg-gradient-to-b from-amber-400/5 to-transparent p-6 text-center transition-all hover:border-amber-400/40"
            >
              <Download className="mx-auto mb-2 text-amber-400/80" size={22} />
              <h3 className="mb-1 font-semibold">My Websites</h3>
              <span className="text-xs text-amber-400/60">Manage your purchases</span>
            </Link>
          </div>

          <div className="flex items-center gap-4 rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent p-6 text-left">
            <ShieldCheck size={28} className="shrink-0 text-emerald-400" />
            <div>
              <h4 className="font-semibold">72-Hour Escrow</h4>
              <p className="text-sm text-white/30">
                {escrow.inEscrow
                  ? `Funds are held for another ${escrow.hoursRemaining} hour${escrow.hoursRemaining === 1 ? '' : 's'}, until you confirm satisfaction.`
                  : 'The escrow window for this order has closed.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
