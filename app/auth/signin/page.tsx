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
    <div className="min-h-screen bg-webmers-black text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-2xl shadow-black/60">
        <Link href="/" className="font-display text-2xl font-bold mb-6 inline-block">Webmers</Link>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Sign In</h1>
        <p className="text-white/40 mb-8">Access your Webmers account</p>

        {(error || urlError) && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-400/10 border border-rose-400/20 text-sm text-rose-300">
            {error || 'Authentication failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleCredentials} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-white text-black font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Continue with Email'}
          </button>
        </form>

        {hasGoogle && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative flex justify-center text-xs text-white/20"><span className="bg-[#0b0b0d] px-3">or</span></span>
            </div>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.2 3.3v2.69h3.57c2.08-1.92 3.28-4.75 3.28-8.01z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.69c-1 .67-2.28 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </>
        )}

        {/* Demo accounts */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-white/30 mb-2">Demo accounts</p>
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
                className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-white/60 hover:border-white/30 hover:text-white transition-colors"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-white/30">
          Don&apos;t have an account?{' '}
          <Link href={`/auth/signup${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-white/60 hover:text-white underline underline-offset-4">
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
