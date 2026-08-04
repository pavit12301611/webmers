import Link from 'next/link';
import { Check } from 'lucide-react';

export default function NewsletterConfirmPage() {
  return (
    <main className="bg-background text-foreground px-6 md:px-10 py-28 md:py-36 flex items-center justify-center min-h-screen">
      <div className="text-center max-w-lg">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700">
          <Check size={28} />
        </div>
        <h1 className="text-3xl md:text-5xl tracking-tight mb-4" style={{ fontFamily: 'var(--font-instrument)' }}>Subscribed</h1>
        <p className="text-[15px] leading-7 text-foreground/45 mb-8">You are now on the list. Weekly curated websites will arrive in your inbox. You can unsubscribe anytime.</p>
        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/90 transition-colors">Back to homepage</Link>
      </div>
    </main>
  );
}
