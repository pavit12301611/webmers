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
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.3)]">
            <CheckCircle size={40} className="text-black" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Purchase Confirmed</h1>
          <p className="text-xl text-white/40 mb-8">
            {order
              ? `${order.listingTitle} is being delivered to your account.`
              : 'Your website is being delivered. Check your dashboard to access the visual editor.'}
          </p>

          {order && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] mb-8 text-left">
              <h3 className="font-display font-bold mb-4">Order Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-white/40">Website</dt><dd className="font-medium">{order.listingTitle}</dd></div>
                <div className="flex justify-between"><dt className="text-white/40">Layout</dt><dd>{order.layoutChoice}</dd></div>
                <div className="flex justify-between"><dt className="text-white/40">Code Unlock</dt><dd>{order.codeUnlocked ? 'Included' : 'Not included'}</dd></div>
                <div className="flex justify-between"><dt className="text-white/40">Status</dt><dd className="text-emerald-300">Paid (in escrow)</dd></div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-base"><dt className="font-semibold">Total</dt><dd className="font-display font-bold">${order.amount}</dd></div>
              </dl>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link href="/editor" className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/20 transition-all text-center">
              <PenTool className="mx-auto mb-2 text-white/70" size={22} />
              <h3 className="font-display font-bold mb-1">Open Editor</h3>
              <span className="text-xs text-white/30">Modify your site instantly</span>
            </Link>
            <Link href="/dashboard/buyer" className="p-6 rounded-3xl bg-gradient-to-b from-amber-400/5 to-transparent border border-amber-400/20 hover:border-amber-400/40 transition-all text-center">
              <Download className="mx-auto mb-2 text-amber-400/80" size={22} />
              <h3 className="font-display font-bold mb-1">My Websites</h3>
              <span className="text-xs text-amber-400/60">Manage your purchases</span>
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.06] flex items-center gap-4 text-left">
            <ShieldCheck size={28} className="text-emerald-400 shrink-0" />
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
