'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role: 'BUYER' }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Account created! Signing in...');
      await signIn('credentials', { email, password, callbackUrl: '/' });
    } else {
      setMessage(data.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-webmers-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md p-8 md:p-12 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-2xl shadow-black/60">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Create Account</h1>
        <p className="text-white/40 mb-8">Join Webmers to buy, edit, and own websites</p>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-1">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-white text-black font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>

        {message && <div className="mt-4 text-sm text-amber-300">{message}</div>}

        <div className="mt-6 text-center text-sm text-white/30">
          Already have an account? <Link href="/auth/signin" className="text-white/60 hover:text-white underline underline-offset-4">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
