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

      // Auto sign-in after a successful signup.
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error) {
        // Account created but auto sign-in failed — send them to sign in.
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
    <div className="min-h-screen bg-webmers-black text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-2xl shadow-black/60">
        <Link href="/" className="font-display text-2xl font-bold mb-6 inline-block">Webmers</Link>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Create Account</h1>
        <p className="text-white/40 mb-8">Join Webmers to buy, edit, and own websites</p>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-400/10 border border-rose-400/20 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-1">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" autoComplete="name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" required />
          </div>

          <div>
            <span className="block text-sm font-medium text-white/60 mb-2">I want to…</span>
            <div className="grid grid-cols-2 gap-3">
              {(['BUYER', 'SELLER'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === r
                      ? 'border-white/60 bg-white/[0.06]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  }`}
                >
                  <div className="font-semibold">{r === 'BUYER' ? 'Buy websites' : 'Sell websites'}</div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {r === 'BUYER' ? 'Browse & purchase sites' : 'List & earn from your sites'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-white text-black font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/30">
          Already have an account?{' '}
          <Link href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-white/60 hover:text-white underline underline-offset-4">
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
