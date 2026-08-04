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
      <div className="flex items-center justify-center gap-3 py-4 text-wander-dark">
        <CheckCircle size={22} className="text-wander-orange" />
        <span className="text-lg font-bold font-heading">{message}</span>
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
          className="flex-1 rounded-full border border-wander-dark/10 bg-gradient-to-b from-white/95 to-[#faf8f4] px-6 py-4 text-wander-dark placeholder-wander-dark/40 outline-none shadow-[inset_0_2px_6px_rgba(143,113,80,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl transition-all focus:border-wander-orange/40 focus:shadow-[inset_0_2px_6px_rgba(143,113,80,0.05),0_0_0_3px_rgba(217,119,43,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]"
          required
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#1f3d47] to-[#2a3b45] px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(22,30,38,0.2),0_3px_8px_rgba(22,30,38,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(22,30,38,0.28),0_5px_12px_rgba(22,30,38,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-60"
        >
          {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {state === 'error' && <p className="mt-3 text-sm text-wander-orange font-medium">{message}</p>}
    </form>
  );
}
