import { Check, ShieldCheck, Lock, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-webmers-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Checkout</h1>
        <p className="text-white/30 mb-12">Secure payment protected by Stripe</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-8">
            {/* Cart Review */}
            <section className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
              <h2 className="text-lg font-display font-bold mb-4">Cart Review</h2>
              <div className="flex gap-4">
                <img src="https://picsum.photos/seed/checkout-site/120/120" alt="Site" className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold">Meridian SaaS</h3>
                  <p className="text-sm text-white/30">SaaS Template</p>
                  <div className="mt-2 text-lg font-display font-bold">$299</div>
                </div>
              </div>
            </section>

            {/* Layout Selection */}
            <section className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
              <h2 className="text-lg font-display font-bold mb-4">Layout Variant</h2>
              <div className="grid grid-cols-3 gap-3">
                {['Hero-Centered', 'Split-Screen', 'Video-Hero'].map((l) => (
                  <label key={l} className="cursor-pointer">
                    <input type="radio" name="layout" value={l} defaultChecked={l === 'Hero-Centered'} className="peer sr-only" />
                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] peer-checked:border-amber-400 peer-checked:bg-amber-400/5 transition-all text-center text-xs text-white/40 peer-checked:text-amber-400 font-medium">
                      {l.replace('-', ' ')}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Code Unlock */}
            <section className="p-6 rounded-3xl bg-gradient-to-b from-amber-400/5 to-transparent border border-amber-400/20">
              <div className="flex items-start gap-4">
                <Lock size={24} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-display font-bold mb-1">Unlock Full Source Code</h2>
                  <p className="text-sm text-white/40 mb-3">Get the complete source code delivered to your verified Gmail with a time-limited download link.</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="accent-amber-400 w-5 h-5" />
                    <span className="text-sm text-white/60">Add code unlock for <span className="font-semibold text-white">$49</span></span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Summary */}
          <div className="space-y-6">
            <section className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
              <h2 className="text-lg font-display font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/50"><span>Meridian SaaS</span><span>$299</span></div>
                <div className="flex justify-between text-white/50"><span>Layout: Hero-Centered</span><span>Included</span></div>
                <div className="flex justify-between text-white/50"><span>Visual Editor</span><span>Included</span></div>
                <div className="flex justify-between text-amber-400/80"><span>Code Unlock</span><span>+ $49</span></div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-display font-bold">
                  <span>Total</span>
                  <span>$348</span>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="p-6 rounded-3xl bg-gradient-to-b from-emerald-400/5 to-transparent border border-emerald-400/20">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck size={22} className="text-emerald-400" />
                <h3 className="font-display font-bold">Escrow Protected</h3>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">Funds are held securely for 72 hours. Confirm satisfaction before release. Full refund within 48 hours if the site doesn't match its description.</p>
            </section>

            {/* Checkout Button */}
            <a href="/checkout/confirmation" className="block w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-center font-bold text-lg hover:scale-[1.01] transition-transform shadow-[0_0_40px_rgba(251,191,36,0.2)] flex items-center justify-center gap-2">
              <CreditCard size={20} /> Pay with Stripe
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
