import Link from 'next/link';
import { Mountain } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer id="footer" className="relative z-10 overflow-hidden pb-12 pt-16 bg-[#f3efe8]">
      <div className="relative mx-auto max-w-[1600px] w-full">
        <div className="flex flex-col items-start justify-between gap-12 rounded-[32px] p-8 md:p-12 bg-wander-dark text-white shadow-sm">
          <div className="max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <Mountain size={30} className="text-wander-orange" />
              <span className="font-heading text-3xl font-bold uppercase tracking-[0.2em] text-white">
                WEBMERS
              </span>
            </div>
            <p className="text-[15px] leading-7 text-white/70 font-body">
              The premier marketplace for launch-ready websites and precision digital gear. Re-think your digital journey with speed, ownership, and simplicity.
            </p>
            <div className="mt-8 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-wander-orange animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
                All systems active &amp; ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3 md:gap-16">
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-wander-orange">
                Categories
              </h4>
              <ul className="space-y-2.5 text-white/70 font-body">
                <li><Link href="/marketplace?cat=Camping" className="transition hover:text-white">Camping</Link></li>
                <li><Link href="/marketplace?cat=Hiking" className="transition hover:text-white">Hiking</Link></li>
                <li><Link href="/marketplace?cat=Backpacks" className="transition hover:text-white">Backpacks</Link></li>
                <li><Link href="/marketplace?cat=Gear" className="transition hover:text-white">Gear</Link></li>
                <li><Link href="/marketplace?cat=Footwear" className="transition hover:text-white">Footwear</Link></li>
                <li><Link href="/marketplace?cat=Accessories" className="transition hover:text-white">Accessories</Link></li>
                <li><Link href="/marketplace?filter=sale" className="text-wander-orange transition hover:text-white">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-wander-orange">
                Platform
              </h4>
              <ul className="space-y-2.5 text-white/70 font-body">
                <li><Link href="/marketplace" className="transition hover:text-white">Marketplace</Link></li>
                <li><Link href="/editor" className="transition hover:text-white">Visual Editor</Link></li>
                <li><Link href="/sell" className="transition hover:text-white">Sell Your Website</Link></li>
                <li><Link href="/faq" className="transition hover:text-white">FAQ</Link></li>
                <li><Link href="/blog" className="transition hover:text-white">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-wander-orange">
                Account
              </h4>
              <ul className="space-y-2.5 text-white/70 font-body">
                <li><Link href="/auth/signin" className="transition hover:text-white">Sign In</Link></li>
                <li><Link href="/auth/signup" className="transition hover:text-white">Create Account</Link></li>
                <li><Link href="/dashboard/buyer" className="transition hover:text-white">Buyer Dashboard</Link></li>
                <li><Link href="/dashboard/seller" className="transition hover:text-white">Seller Dashboard</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-wander-dark/10 pt-6 md:flex-row text-wander-dark/70 font-body">
          <div className="text-xs font-medium uppercase tracking-[0.16em]">
            © {new Date().getFullYear()} WEBMERS Platform
          </div>
          <div className="flex gap-6 text-xs font-medium uppercase tracking-[0.16em]">
            <Link href="/privacy" className="transition hover:text-wander-orange">Privacy</Link>
            <Link href="/terms" className="transition hover:text-wander-orange">Terms</Link>
            <Link href="/cookies" className="transition hover:text-wander-orange">Cookies</Link>
            <Link href="/support" className="transition hover:text-wander-orange">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
