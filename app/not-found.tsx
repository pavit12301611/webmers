import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Not Found' };

export default function NotFound() {
  return (
    <main className="min-h-screen bg-webmers-black text-foreground flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="relative z-10">
        <div className="text-7xl md:text-9xl font-display font-bold text-foreground mb-4">
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold mb-3">This page drifted off into the night</h1>
        <p className="text-foreground/40 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="px-7 py-3 rounded-full bg-white text-black font-medium hover:scale-[1.02] transition-transform">
            Back home
          </Link>
          <Link href="/marketplace" className="px-7 py-3 rounded-full border border-white/15 text-foreground font-medium hover:bg-white/5 transition-colors">
            Browse marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}
