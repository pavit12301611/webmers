'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    { id: 1, from: 'Sarah K.', subject: 'Meridian SaaS – customization help', preview: 'Thanks for your purchase! Let me know if you need help with the editor.', date: '2 days ago' },
    { id: 2, from: 'Admin', subject: 'Order #o_3 payment confirmed', preview: 'Your payment has been verified. The seller has been notified.', date: '5 days ago' },
  ]);
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState('');

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div>Please <Link href="/auth/signin" className="underline">sign in</Link> to view messages.</div>
      </div>
    );
  }

  const handleSend = () => {
    if (!reply.trim()) return;
    alert('Message sent! (In production this would be saved to DB)');
    setReply('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Messages</h1>
          <Link href="/dashboard/buyer" className="text-sm text-foreground/60 hover:text-foreground">← Back to dashboard</Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Inbox */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-4 text-xs uppercase tracking-widest text-foreground/40">Inbox</div>
              {messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`mb-2 w-full rounded-xl border p-4 text-left transition ${selected === m.id ? 'border-white/40 bg-white/5' : 'border-white/10 hover:bg-white/[0.03]'}`}
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{m.from}</span>
                    <span className="text-[10px] text-foreground/40">{m.date}</span>
                  </div>
                  <div className="mt-1 text-sm text-foreground/80">{m.subject}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-foreground/50">{m.preview}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 min-h-[420px]">
              {!selected ? (
                <div className="flex h-full items-center justify-center text-foreground/40">Select a conversation</div>
              ) : (
                <>
                  <div className="mb-6 border-b border-white/10 pb-4">
                    <div className="font-medium">Re: {messages.find(m => m.id === selected)?.subject}</div>
                    <div className="text-xs text-foreground/40">with {messages.find(m => m.id === selected)?.from}</div>
                  </div>

                  <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
                    <p>Hi! Thanks for purchasing Meridian SaaS. The editor is already live on your dashboard. Let me know if you need any help with branding or adding your own domain.</p>
                    <p className="text-foreground/50">— Sarah K. (Seller)</p>
                  </div>

                  <div className="mt-10">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none focus:border-white/30"
                      rows={4}
                    />
                    <button
                      onClick={handleSend}
                      className="mt-3 rounded-full bg-white px-8 py-2.5 text-sm font-medium text-black hover:bg-white/90"
                    >
                      Send reply
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
