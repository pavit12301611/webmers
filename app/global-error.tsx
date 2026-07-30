import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Server Error' };

export default function GlobalError({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] via-[#0a0a14] to-[#050505]" />
      <div className="relative z-10">
        <div className="text-7xl md:text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-rose-300/60 to-rose-500/20 mb-4">500</div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold mb-3">Something went wrong</h1>
        <p className="text-white/40 mb-8 max-w-md mx-auto">
          Our servers encountered an unexpected issue. Try refreshing or return home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reset && (
            <button onClick={reset} className="px-7 py-3 rounded-full bg-rose-500 text-white font-medium hover:scale-[1.02] transition-transform">
              Try again
            </button>
          )}
          <Link href="/" className="px-7 py-3 rounded-full border border-white/15 text-white font-medium hover:bg-white/5 transition-colors">Back home</Link>
        </div>
      </div>
    </main>
  );
}
