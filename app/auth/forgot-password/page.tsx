'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send reset code.');
      } else {
        setSuccess(data.message || 'Check your email for a reset code.');
        setStep('verify');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
      } else {
        setSuccess('Password reset successfully! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 1800);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="fp-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fp-grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl md:p-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <svg viewBox="0 0 256 256" width="22" height="22" fill="#1f3d47">
            <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
          </svg>
          <span className="text-xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Webmers</span>
        </Link>

        <h1 className="mb-2 text-3xl tracking-tight md:text-4xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
          {step === 'request' ? 'Forgot password?' : 'Reset password'}
        </h1>
        <p className="mb-8 text-foreground/40">
          {step === 'request' 
            ? 'Enter your email and we’ll send a 6-digit code.' 
            : 'Enter the code we sent and choose a new password.'}
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-[11px] uppercase tracking-widest text-foreground/40">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-foreground placeholder-foreground/25 outline-none backdrop-blur-xl transition-colors focus:border-white/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white py-3.5 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Sending code…' : 'Send reset code'}
            </button>

            <p className="text-center text-[10px] text-foreground/25">
              Uses free temporary inbox (no API key needed)
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="otp" className="mb-1 block text-[11px] uppercase tracking-widest text-foreground/40">
                6-digit code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-center font-mono text-2xl tracking-[8px] text-foreground placeholder-foreground/25 outline-none backdrop-blur-xl transition-colors focus:border-white/20"
                required
              />
              <p className="mt-1 text-[11px] text-foreground/30">Check your email (and spam folder).</p>
            </div>

            <div>
              <label htmlFor="newPassword" className="mb-1 block text-[11px] uppercase tracking-widest text-foreground/40">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={12}
                className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-foreground placeholder-foreground/25 outline-none backdrop-blur-xl transition-colors focus:border-white/20"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-[11px] uppercase tracking-widest text-foreground/40">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={12}
                className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 text-foreground placeholder-foreground/25 outline-none backdrop-blur-xl transition-colors focus:border-white/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otp || otp.length !== 6}
              className="w-full rounded-full bg-white py-3.5 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Resetting…' : 'Reset password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('request');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
                setSuccess('');
              }}
              className="w-full text-center text-sm text-foreground/50 hover:text-foreground/70"
            >
              Send a new code
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-foreground/30">
          Remembered your password?{' '}
          <Link href="/auth/signin" className="text-foreground/60 underline underline-offset-4 hover:text-foreground">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
