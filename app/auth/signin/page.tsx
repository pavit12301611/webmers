'use client';

import { Suspense, useEffect, useState } from 'react';
import { getProviders, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DEMO_ACCOUNTS = [
  { label: 'Buyer', email: 'buyer@webmers.io', password: 'Buyer@123' },
  { label: 'Seller', email: 'seller@webmers.io', password: 'Seller@123' },
  { label: 'Admin', email: 'admin@webmers.io', password: 'Admin@123' },
];

/**
 * Demo credentials are public, so the shortcut buttons must never reach a
 * production build. The seeded demo users are also omitted from the data layer
 * when NODE_ENV is production.
 */
const SHOW_DEMO_ACCOUNTS = process.env.NODE_ENV !== 'production';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGoogle, setHasGoogle] = useState(false);

  useEffect(() => {
    getProviders().then((providers) => setHasGoogle(!!providers?.google));
  }, []);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError('Invalid email or password. Please try again.');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%"><defs><pattern id="auth-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" /></pattern></defs><rect width="100%" height="100%" fill="url(#auth-grid)" /></svg>
      </div>

      <div className="relative w-full max-w-md rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl md:p-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <svg viewBox="0 0 256 256" width="22" height="22" fill="white"><path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" /></svg>
          <span className="text-xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Webmers</span>
        </Link>
        <h1 className="mb-2 text-3xl tracking-tight md:text-4xl" style={{ fontFamily: "'Instrument Serif', serif" }}>Sign In</h1>
        <p className="mb-8 text-white/40">Access your measured account</p>

        {(error || urlError) && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error || 'Authentication failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleCredentials} className="mb-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/25 outline-none backdrop-blur-xl transition-colors focus:border-white/20"
              required
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-[11px] uppercase tracking-widest text-white/40">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/25 outline-none backdrop-blur-xl transition-colors focus:border-white/20"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-3.5 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Continue with Email'}
          </button>
        </form>

        {hasGoogle && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative flex justify-center text-[11px] uppercase tracking-widest text-white/20"><span className="bg-[#101010] px-3">or</span></span>
            </div>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 py-3.5 font-medium text-white/80 transition hover:bg-white/[0.04]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.2 3.3v2.69h3.57c2.08-1.92 3.28-4.75 3.28-8.01z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.69c-1 .67-2.28 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </>
        )}

        {SHOW_DEMO_ACCOUNTS && (
        <div className="mb-6 mt-6">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-white/25">Demo accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setError('');
                }}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
        )}

        <div className="mt-6 text-center text-sm text-white/30">
          Don&apos;t have an account?{' '}
          <Link href={`/auth/signup${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-white/60 underline underline-offset-4 hover:text-white">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
