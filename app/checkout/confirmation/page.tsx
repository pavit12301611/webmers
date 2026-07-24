import { CheckCircle, Download, ShieldCheck } from 'lucide-react';

export default function CheckoutConfirmation() {
  return (
    <div className="min-h-screen bg-webmers-black text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.3)]">
          <CheckCircle size={40} className="text-black" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Purchase Confirmed</h1>
        <p className="text-xl text-white/40 mb-8">Your website is being delivered. Check your dashboard to access the visual editor.</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <a href="/dashboard/buyer" className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/20 transition-all block text-center">
            <h3 className="font-display font-bold mb-1">Go to Editor</h3>
            <span className="text-xs text-white/30">Modify your site instantly</span>
          </a>
          <a href="#" className="p-6 rounded-3xl bg-gradient-to-b from-amber-400/5 to-transparent border border-amber-400/20 hover:border-amber-400/40 transition-all block text-center">
            <h3 className="font-display font-bold mb-1">Download Code</h3>
            <span className="text-xs text-amber-400/60">If unlocked during checkout</span>
          </a>
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
  );
}
