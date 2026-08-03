import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle, Download, PenTool, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import { getOrder } from '@/lib/data';

export const metadata: Metadata = { title: 'Purchase Confirmed' };

export default async function CheckoutConfirmation({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const order = searchParams.order ? await getOrder(searchParams.order) : null;

  return (
    <main className="relative min-h-screen">
      <Header />
      <div className="min-h-screen flex items-center justify-center px-6 py-28">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-foreground flex items-center justify-center">
            <CheckCircle size={40} className="text-background" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">{order?.status === 'PAID' || order?.status === 'COMPLETED' ? 'Purchase Confirmed' : 'Payment Pending'}</h1>
          <p className="text-xl text-white/40 mb-8">
            {order && (order.status === 'PAID' || order.status === 'COMPLETED')
              ? `${order.listingTitle} is being delivered to your account.`
              : 'Your payment is awaiting verification. Access is released after payment approval.'}
          </p>

          {order && (
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/[0.08] mb-8 text-left">
              <h3 className="font-display font-bold mb-4">Order Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-white/40">Website</dt><dd className="font-medium">{order.listingTitle}</dd></div>
                <div className="flex justify-between"><dt className="text-white/40">Layout</dt><dd>{order.layoutChoice}</dd></div>
                <div className="flex justify-between"><dt className="text-white/40">Code Unlock</dt><dd>{order.codeUnlocked ? 'Included' : 'Not included'}</dd></div>
                <div className="flex justify-between"><dt className="text-white/40">Status</dt><dd className={order.status === 'PAID' || order.status === 'COMPLETED' ? 'text-foreground' : 'text-foreground/60'}>{order.status === 'PAID' || order.status === 'COMPLETED' ? 'Paid (in escrow)' : 'Awaiting payment approval'}</dd></div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-base"><dt className="font-semibold">Total</dt><dd className="font-display font-bold">₹{order.amount}</dd></div>
              </dl>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link href="/editor" className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all text-center">
              <PenTool className="mx-auto mb-2 text-white/70" size={22} />
              <h3 className="font-display font-bold mb-1">Open Editor</h3>
              <span className="text-xs text-white/30">Modify your site instantly</span>
            </Link>
            <Link href="/dashboard/buyer" className="p-6 rounded-3xl bg-foreground/5 border border-foreground/20 hover:border-foreground/40 transition-all text-center">
              <Download className="mx-auto mb-2 text-foreground/80" size={22} />
              <h3 className="font-display font-bold mb-1">My Websites</h3>
              <span className="text-xs text-foreground/60">Manage your purchases</span>
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-4 text-left">
            <ShieldCheck size={28} className="text-foreground shrink-0" />
            <div>
              <h4 className="font-semibold">72-Hour Escrow</h4>
              <p className="text-sm text-white/30">Funds are held until you confirm satisfaction. Full refund available within 48 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
