'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import Thumbnail from './Thumbnail';

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** Price of the code-unlock add-on (mirrors the server-side value). */
const CODE_UNLOCK_PRICE = 49;
const PLATFORM_MARKUP_RATE = 0.2;

const LAYOUTS = ['Hero-Centered', 'Split-Screen', 'Video-Hero'] as const;

type ListingLite = {
  id: string;
  title: string;
  tagline: string;
  price: number;
  category: string;
  palette: [string, string];
};

export default function CheckoutForm({ listing }: { listing: ListingLite }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [layout, setLayout] = useState<(typeof LAYOUTS)[number]>('Hero-Centered');
  const [codeUnlocked, setCodeUnlocked] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const customerPrice = useMemo(() => Math.round(listing.price * (1 + PLATFORM_MARKUP_RATE) * 100) / 100, [listing.price]);
  const total = useMemo(() => customerPrice + (codeUnlocked ? CODE_UNLOCK_PRICE : 0), [customerPrice, codeUnlocked]);

  const onPay = async () => {
    if (state === 'loading') return;

    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/checkout?listing=${listing.id}`)}`);
      return;
    }

    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, layoutChoice: layout, codeUnlocked }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.orderId && data.gatewayOrderId) {
        const loaded = await loadRazorpay();
        if (!loaded || !window.Razorpay) throw new Error('Unable to load secure payment window.');
        new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: data.name,
          description: data.description,
          order_id: data.gatewayOrderId,
          prefill: { email: session.user?.email || '' },
          theme: { color: '#111111' },
          handler: async (payment: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            const verification = await fetch('/api/payments/razorpay/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderId, ...payment }),
            });
            if (verification.ok) router.push(`/checkout/confirmation?order=${encodeURIComponent(data.orderId)}`);
            else { const result = await verification.json().catch(() => ({})); setState('error'); setError(result.error || 'Payment could not be verified.'); }
          },
          modal: { ondismiss: () => setState('idle') },
        }).open();
      } else {
        setState('error');
        setError(data.error || 'Unable to start payment. Please try again.');
      }
    } catch {
      setState('error');
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Left */}
      <div className="space-y-8">
        {/* Cart */}
        <section className="leaf-card rounded-[1.8rem] p-6">
          <h2 className="text-lg font-display font-bold mb-4">Cart Review</h2>
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
              <Thumbnail title={listing.title} palette={listing.palette} showChrome={false} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{listing.title}</h3>
              <p className="text-sm text-foreground/38">{listing.category}</p>
              <div className="mt-2 text-lg font-display font-bold">₹{customerPrice}</div>
            </div>
          </div>
        </section>

        {/* Layout */}
        <section className="leaf-card rounded-[1.8rem] p-6">
          <h2 className="text-lg font-display font-bold mb-4">Layout Variant</h2>
          <div className="grid grid-cols-3 gap-3">
            {LAYOUTS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLayout(l)}
                className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                  layout === l
                    ? 'border-foreground bg-foreground/10 text-foreground'
                    : 'border-foreground/10 bg-background/20 text-foreground/45 hover:border-lime-100/25'
                }`}
              >
                {l.replace('-', ' ')}
              </button>
            ))}
          </div>
        </section>

        {/* Code unlock */}
        <section className="leaf-card rounded-[1.8rem] p-6">
          <div className="flex items-start gap-4">
            <Lock size={24} className="text-foreground shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-display font-bold mb-1">Unlock Full Source Code</h2>
              <p className="text-sm text-foreground/45 mb-3">
                Get the complete source code delivered with a time-limited download link.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={codeUnlocked}
                  onChange={(e) => setCodeUnlocked(e.target.checked)}
                  className="accent-lime-300 w-5 h-5"
                />
                <span className="text-sm text-foreground/62">
                  Add code unlock for <span className="font-semibold text-foreground">₹{CODE_UNLOCK_PRICE}</span>
                </span>
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* Right */}
      <div className="space-y-6">
        <section className="leaf-card rounded-[1.8rem] p-6">
          <h2 className="text-lg font-display font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-foreground/55"><span>{listing.title}</span><span>₹{listing.price}</span></div>
            <div className="flex justify-between text-foreground/55"><span>Marketplace service fee (20%)</span><span>₹{(customerPrice - listing.price).toFixed(2)}</span></div>
            <div className="flex justify-between text-foreground/55"><span>Layout: {layout}</span><span>Included</span></div>
            <div className="flex justify-between text-foreground/55"><span>Visual Editor</span><span>Included</span></div>
            <div className={`flex justify-between ${codeUnlocked ? 'text-foreground/90' : 'text-foreground/38'}`}>
              <span>Code Unlock</span>
              <span>{codeUnlocked ? `+ ₹${CODE_UNLOCK_PRICE}` : '—'}</span>
            </div>
            <div className="border-t border-foreground/10 pt-3 flex justify-between text-xl font-display font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </section>

        <section className="leaf-card rounded-[1.8rem] p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck size={22} className="text-foreground" />
            <h3 className="font-display font-bold">Escrow Protected</h3>
          </div>
          <p className="text-sm text-foreground/45 leading-relaxed">
            Pay securely with UPI or a QR code through Razorpay. Payment is verified with a signed payment response and webhook before an order is marked paid.
          </p>
          <p className="mt-3 text-xs text-foreground/35">All checkout amounts are shown in INR (₹).</p>
        </section>

        {error && <p className="text-sm text-foreground">{error}</p>}

        {status !== 'loading' && !session && (
          <p className="text-sm text-foreground/45">
            You&apos;ll be asked to <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(`/checkout?listing=${listing.id}`)}`} className="text-foreground underline underline-offset-4">sign in</Link> before paying.
          </p>
        )}

        <button
          type="button"
          onClick={onPay}
          disabled={state === 'loading'}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-foreground text-background text-center font-bold text-lg hover:scale-[1.01] transition-transform disabled:opacity-60"
        >
          <CreditCard size={20} /> {state === 'loading' ? 'Processing…' : `Pay ₹${total}`}
        </button>
      </div>
    </div>
  );
}
