'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'loading') return;
    setState('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState('success');
        setMessage(data.message || "You're on the list!");
        setEmail('');
      } else {
        setState('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setState('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (state === 'success') {
    return (
      <div className="flex items-center justify-center gap-3 py-4 text-white">
        <CheckCircle size={22} />
        <span className="text-lg font-medium">{message}</span>
      </div>
    );
  }

  return (
    <form className="mx-auto max-w-md" onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-white placeholder-white/30 outline-none backdrop-blur-xl transition-colors focus:border-white/20"
          required
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
        >
          {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {state === 'error' && <p className="mt-3 text-sm text-rose-300">{message}</p>}
    </form>
  );
}
