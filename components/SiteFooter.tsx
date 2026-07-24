import Link from 'next/link';
import { Leaf } from 'lucide-react';

const GRASS_HEIGHTS = [78, 110, 64, 128, 92, 70, 118, 84, 100, 60, 122, 88, 96, 73, 116, 86];

/** Nature footer with a soft dawn gradient and lightweight animated grass. */
export default function SiteFooter() {
  return (
    <footer className="relative z-10 overflow-hidden bg-gradient-to-b from-[#07130e] via-[#153923] to-[#dceec7] px-6 pt-28 pb-14 text-[#07130e] md:px-16">
      <div className="absolute left-10 top-14 h-40 w-40 rounded-full bg-lime-200/20 blur-3xl" aria-hidden="true" />
      <div
        className="absolute right-12 top-20 h-24 w-24 rounded-full bg-gradient-to-br from-[#fff6c8] to-[#d99d54] shadow-[0_0_80px_20px_rgba(244,213,141,0.30)] md:right-24 md:h-32 md:w-32"
        aria-hidden="true"
      />

      <div className="absolute bottom-0 left-0 right-0 flex h-28 items-end justify-around opacity-60 md:h-36" aria-hidden="true">
        {GRASS_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="w-1 origin-bottom animate-sway rounded-t-full bg-gradient-to-t from-emerald-900 to-emerald-400 md:w-2"
            style={{ height: `${h}px`, animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl rounded-[2rem] border border-white/35 bg-[#f7f5ea]/72 p-7 shadow-[0_24px_90px_rgba(6,16,12,0.18)] backdrop-blur-xl md:p-10">
        <div className="mb-14 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 inline-flex items-center gap-2 font-display text-3xl font-bold md:text-5xl">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-600 text-[#07130e]"><Leaf size={22} fill="currentColor" /></span>
              Webmers
            </div>
            <p className="max-w-md text-base leading-7 text-[#07130e]/60 md:text-lg">
              The calm marketplace for fully-built websites. Buy. Edit. Own. Then let your digital presence grow.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-[#07130e]/56">
              <li><Link href="/marketplace" className="hover:text-[#07130e] transition-colors">Marketplace</Link></li>
              <li><Link href="/editor" className="hover:text-[#07130e] transition-colors">Visual Editor</Link></li>
              <li><Link href="/#pricing" className="hover:text-[#07130e] transition-colors">Code Unlock</Link></li>
              <li><Link href="/#how" className="hover:text-[#07130e] transition-colors">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-[#07130e]/56">
              <li><Link href="/auth/signin" className="hover:text-[#07130e] transition-colors">Sign in</Link></li>
              <li><Link href="/auth/signup" className="hover:text-[#07130e] transition-colors">Create account</Link></li>
              <li><Link href="/dashboard/buyer" className="hover:text-[#07130e] transition-colors">Buyer dashboard</Link></li>
              <li><Link href="/dashboard/seller" className="hover:text-[#07130e] transition-colors">Seller dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#07130e]/10 pt-7 text-sm text-[#07130e]/45 md:flex-row">
          <span>© {new Date().getFullYear()} Webmers. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/#pricing" className="hover:text-[#07130e] transition-colors">Privacy</Link>
            <Link href="/#pricing" className="hover:text-[#07130e] transition-colors">Terms</Link>
            <Link href="/#pricing" className="hover:text-[#07130e] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
