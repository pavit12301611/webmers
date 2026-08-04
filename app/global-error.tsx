'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="relative z-10">
            <div className="text-7xl md:text-9xl font-display font-bold text-foreground mb-4">500</div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold mb-3">Something went wrong</h1>
            <p className="text-foreground/40 mb-8 max-w-md mx-auto">
              Our servers encountered an unexpected issue. Try refreshing or return home.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {reset && (
                <button onClick={reset} className="px-7 py-3 rounded-full bg-rose-500 text-foreground font-medium hover:scale-[1.02] transition-transform">
                  Try again
                </button>
              )}
              <Link href="/" className="px-7 py-3 rounded-full border border-white/15 text-foreground font-medium hover:bg-white/5 transition-colors">Back home</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
