'use client';

import { Suspense, useEffect, useState } from 'react';
import { getProviders, signIn } from 'next-auth/react';
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
  const [upiId, setUpiId] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGoogle, setHasGoogle] = useState(false);

  // Sandbox states
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxEmail, setSandboxEmail] = useState('google-buyer@example.com');
  const [sandboxName, setSandboxName] = useState('John Doe');
  const [sandboxRole, setSandboxRole] = useState<Role>('BUYER');
  const [sandboxLoading, setSandboxLoading] = useState(false);

  useEffect(() => {
    getProviders().then((providers) => setHasGoogle(!!providers?.google));
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, upiId, paypalEmail }),
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

  const handleGoogleClick = () => {
    if (hasGoogle) {
      signIn('google', { callbackUrl: callbackUrl || '/' });
    } else {
      setShowSandboxModal(true);
    }
  };

  const handleSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sandboxLoading) return;
    setSandboxLoading(true);

    const res = await signIn('credentials', {
      email: sandboxEmail,
      isGoogleSandbox: 'true',
      googleName: sandboxName,
      googleRole: sandboxRole,
      redirect: false,
    });
    setSandboxLoading(false);

    if (res?.error) {
      setError('Google sandbox authentication failed.');
      setShowSandboxModal(false);
      return;
    }

    setShowSandboxModal(false);
    const destination =
      callbackUrl || (sandboxRole === 'SELLER' ? '/dashboard/seller' : '/dashboard/buyer');
    router.push(destination);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-white relative">
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="su-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#su-grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl md:p-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <svg viewBox="0 0 256 256" width="22" height="22" fill="white">
            <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
          </svg>
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
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 12 characters" autoComplete="new-password" minLength={12} className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/25 outline-none focus:border-white/20" required />
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

          {role === 'SELLER' && (
            <div className="rounded-[1.2rem] border border-amber-400/20 bg-amber-400/[0.04] p-4">
              <p className="mb-3 text-[11px] uppercase tracking-widest text-amber-100/70">Seller payout method — add at least one</p>
              <div className="space-y-3">
                <div><label htmlFor="upiId" className="mb-1 block text-xs text-white/55">UPI ID</label><input id="upiId" type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@okaxis" autoComplete="off" className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/25 outline-none focus:border-white/20" /></div>
                <div><label htmlFor="paypalEmail" className="mb-1 block text-xs text-white/55">PayPal email</label><input id="paypalEmail" type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-white placeholder-white/25 outline-none focus:border-white/20" /></div>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-amber-100/50">A UPI ID or PayPal email is required. Enter only payout details — never a UPI PIN, password, or OTP.</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full rounded-full bg-white py-3.5 font-medium text-black transition hover:bg-white/90 disabled:opacity-50">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <span className="relative flex justify-center text-[11px] uppercase tracking-widest text-white/20">
            <span className="bg-[#0e0e0e] px-3">or</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleClick}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 py-3.5 font-medium text-white/80 transition hover:bg-white/[0.04]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.2 3.3v2.69h3.57c2.08-1.92 3.28-4.75 3.28-8.01z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.69c-1 .67-2.28 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google {!hasGoogle && <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded-full ml-1">Sandbox</span>}
        </button>

        <div className="mt-6 text-center text-sm text-white/30">
          Already have an account?{' '}
          <Link href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-white/60 underline underline-offset-4 hover:text-white">
            Sign in
          </Link>
        </div>
      </div>

      {/* Sandbox Google Sign In Modal */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f0f11] p-8 text-white shadow-2xl animate-in fade-in duration-200">
            <button
              onClick={() => setShowSandboxModal(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.2 3.3v2.69h3.57c2.08-1.92 3.28-4.75 3.28-8.01z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.69c-1 .67-2.28 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <div>
                <h3 className="text-xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Google Sign-In Sandbox</h3>
                <p className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Active & Configured</p>
              </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed mb-6">
              Google OAuth client keys are not set in `.env`. We have provisioned this interactive Sandbox so you can instantly simulate Google OAuth profiles with one click.
            </p>

            {/* Quick Presets */}
            <div className="mb-6">
              <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-3">Quick Profiles</span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setSandboxEmail('pavitsingh1611@gmail.com');
                    setSandboxName('Pavit Singh');
                    setSandboxRole('BUYER'); // Special admin email automatically gets ADMIN role
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    sandboxEmail === 'pavitsingh1611@gmail.com'
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">Pavit Singh (Admin)</div>
                    <div className="text-[10px] opacity-60">pavitsingh1611@gmail.com</div>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSandboxEmail('google-buyer@example.com');
                    setSandboxName('John Buyer');
                    setSandboxRole('BUYER');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    sandboxEmail === 'google-buyer@example.com'
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">John Buyer (Default)</div>
                    <div className="text-[10px] opacity-60">google-buyer@example.com</div>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Buyer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSandboxEmail('google-seller@example.com');
                    setSandboxName('Sarah Seller');
                    setSandboxRole('SELLER');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    sandboxEmail === 'google-seller@example.com'
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">Sarah Seller</div>
                    <div className="text-[10px] opacity-60">google-seller@example.com</div>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Seller</span>
                </button>
              </div>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative flex justify-center text-[9px] uppercase tracking-widest text-white/20">
                <span className="bg-[#0f0f11] px-3">or customize</span>
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSandboxSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-widest text-white/40">Sandbox Google Email</label>
                <input
                  type="email"
                  value={sandboxEmail}
                  onChange={(e) => setSandboxEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white outline-none focus:border-white/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-widest text-white/40">Profile Name</label>
                <input
                  type="text"
                  value={sandboxName}
                  onChange={(e) => setSandboxName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white outline-none focus:border-white/20"
                  required
                />
              </div>

              {sandboxEmail !== 'pavitsingh1611@gmail.com' && (
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-widest text-white/40">Select Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['BUYER', 'SELLER'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSandboxRole(r)}
                        className={`rounded-xl border p-2 text-center text-xs transition-all ${
                          sandboxRole === r
                            ? 'border-white bg-white text-black'
                            : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {r === 'BUYER' ? 'Buyer' : 'Seller'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={sandboxLoading}
                className="w-full rounded-full bg-white py-3 font-semibold text-black transition hover:bg-white/90 disabled:opacity-50 text-sm mt-2"
              >
                {sandboxLoading ? 'Connecting…' : 'Continue with Google Account'}
              </button>
            </form>
          </div>
        </div>
      )}
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
