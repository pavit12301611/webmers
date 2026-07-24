import Link from 'next/link';

const GRASS_HEIGHTS = [78, 110, 64, 128, 92, 70, 118, 84, 100, 60, 122, 88];

/**
 * The signature daytime footer: a sky-blue gradient with a glowing sun and
 * gently swaying grass — the "dawn" that follows the night-themed hero.
 * Fully self-contained (no external assets).
 */
export default function SiteFooter() {
  return (
    <footer className="relative z-10 overflow-hidden bg-gradient-to-b from-[#87CEEB] via-[#b0e2ff] to-[#e8f6ff] text-black pt-28 pb-16 px-6 md:px-16">
      {/* Sun */}
      <div
        className="absolute top-8 right-12 md:right-24 w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#ffeb3b] to-[#ff9800] shadow-[0_0_80px_20px_rgba(255,235,59,0.5)]"
        aria-hidden="true"
      />

      {/* Grass */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 flex items-end justify-around opacity-60" aria-hidden="true">
        {GRASS_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="w-1 md:w-2 bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t-full animate-sway origin-bottom"
            style={{ height: `${h}px`, animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="font-display text-3xl md:text-5xl font-bold mb-4">Webmers</h3>
            <p className="text-black/50 text-base md:text-lg max-w-md">
              The premium marketplace for fully-built websites. Buy. Edit. Own.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-black/50 text-sm">
              <li><Link href="/marketplace" className="hover:text-black transition-colors">Marketplace</Link></li>
              <li><Link href="/editor" className="hover:text-black transition-colors">Visual Editor</Link></li>
              <li><Link href="/#pricing" className="hover:text-black transition-colors">Code Unlock</Link></li>
              <li><Link href="/#how" className="hover:text-black transition-colors">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-black/50 text-sm">
              <li><Link href="/auth/signin" className="hover:text-black transition-colors">Sign in</Link></li>
              <li><Link href="/auth/signup" className="hover:text-black transition-colors">Create account</Link></li>
              <li><Link href="/dashboard/buyer" className="hover:text-black transition-colors">Buyer dashboard</Link></li>
              <li><Link href="/dashboard/seller" className="hover:text-black transition-colors">Seller dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-black/40">
          <span>© {new Date().getFullYear()} Webmers. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/#pricing" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/#pricing" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/#pricing" className="hover:text-black transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
