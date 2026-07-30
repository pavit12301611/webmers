'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Route error:', error); }, [error]);
  return <main className="grid min-h-screen place-items-center bg-[#0a0a0a] px-6 text-center text-white"><div><p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Something went wrong</p><h1 className="mt-4 text-5xl" style={{ fontFamily: 'var(--font-instrument)' }}>Let&apos;s get you back on track.</h1><p className="mx-auto mt-5 max-w-md text-white/50">The page could not be completed. Your information has not been changed.</p><div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">Try again</button><Link href="/" className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/70">Go home</Link></div></div></main>;
}
