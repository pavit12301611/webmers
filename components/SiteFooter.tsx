import Link from 'next/link';
import GridPattern from './GridPattern';

export default function SiteFooter() {
  return (
    <footer id="footer" className="relative z-10 overflow-hidden bg-[#0a0a0a] pb-12 pt-28">
      <GridPattern id="footer-grid" opacity={0.06} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

      <div className="relative mx-auto max-w-[120rem] px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-12 rounded-[2rem] p-8 liquid-glass md:flex-row md:p-12">
          <div className="max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <svg viewBox="0 0 256 256" width="26" height="26" fill="white" aria-hidden="true">
                <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
              </svg>
              <span className="text-3xl tracking-tight text-white" style={{ fontFamily: 'var(--font-instrument)' }}>
                Webmers
              </span>
            </div>
            <p className="text-[15px] leading-7 text-white/55">
              Measured marketplace for launch-ready websites. Buy a polished site, edit it visually, and own a measured digital home.
            </p>
            <div className="mt-8 flex gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">All systems measured</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3 md:gap-20">
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">Product</h4>
              <ul className="space-y-2.5 text-white/60">
                <li><Link href="/marketplace" className="transition hover:text-white">Marketplace</Link></li>
                <li><Link href="/editor" className="transition hover:text-white">Visual Editor</Link></li>
                <li><Link href="#pricing" className="transition hover:text-white">Code Unlock</Link></li>
                <li><Link href="#how" className="transition hover:text-white">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">Account</h4>
              <ul className="space-y-2.5 text-white/60">
                <li><Link href="/auth/signin" className="transition hover:text-white">Sign in</Link></li>
                <li><Link href="/auth/signup" className="transition hover:text-white">Create account</Link></li>
                <li><Link href="/dashboard/buyer" className="transition hover:text-white">Buyer dashboard</Link></li>
                <li><Link href="/dashboard/seller" className="transition hover:text-white">Seller dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">Measured</h4>
              <ul className="space-y-2.5 text-white/60">
                <li><span className="text-white/30">Precision-built</span></li>
                <li><span className="text-white/30">Dark mode native</span></li>
                <li><span className="text-white/30">Spotlight reveal</span></li>
                <li><span className="text-white/30">100vh hero</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-[11px] uppercase tracking-[0.16em] text-white/25 md:flex-row">
          <span>© {new Date().getFullYear()} Webmers — Measured Edition</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition hover:text-white/60">Privacy</Link>
            <Link href="/terms" className="transition hover:text-white/60">Terms</Link>
            <Link href="/cookies" className="transition hover:text-white/60">Cookies</Link>
            <Link href="/support" className="transition hover:text-white/60">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
