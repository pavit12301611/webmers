'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Role = 'BUYER' | 'SELLER';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('BUYER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error) {
        router.push('/auth/signin');
        return;
      }
      const destination =
        callbackUrl || (role === 'SELLER' ? '/dashboard/seller' : '/dashboard/buyer');
      router.push(destination);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%"><defs><pattern id="su-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" /></pattern></defs><rect width="100%" height="100%" fill="url(#su-grid)" /></svg>
      </div>

      <div className="relative w-full max-w-md rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl md:p-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <svg viewBox="0 0 256 256" width="22" height="22" fill="white"><path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" /></svg>
          <span className="text-xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Webmers</span>
        </Link>
        <h1 className="mb-2 text-3xl tracking-tight md:text-4xl" style={{ fontFamily: "'Instrument Serif', serif" }}>Create Account</h1>
        <p className="mb-8 text-white/40">Join Webmers to buy, edit, and own websites</p>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" autoComplete="name" className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/25 outline-none focus:border-white/20" required />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/25 outline-none focus:border-white/20" required />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/25 outline-none focus:border-white/20" required />
          </div>

          <div>
            <span className="mb-2 block text-[11px] uppercase tracking-widest text-white/40">I want to…</span>
            <div className="grid grid-cols-2 gap-3">
              {(['BUYER', 'SELLER'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-[1.2rem] border p-4 text-left transition-all ${
                    role === r
                      ? 'border-white bg-white text-black'
                      : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-semibold">{r === 'BUYER' ? 'Buy websites' : 'Sell websites'}</div>
                  <div className="mt-1 text-[11px] opacity-60">
                    {r === 'BUYER' ? 'Browse & purchase sites' : 'List & earn from your sites'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-full bg-white py-3.5 font-medium text-black transition hover:bg-white/90 disabled:opacity-50">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/30">
          Already have an account?{' '}
          <Link href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-white/60 underline underline-offset-4 hover:text-white">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
