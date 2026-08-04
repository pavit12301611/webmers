'use client';

/**
 * PSD — Webmers' built-in chat assistant widget.
 *
 * Floating claymorphism chat bubble styled to match the Webmers design system
 * (wander-dark / wander-orange / clay surfaces). Talks to the local, keyless
 * PSD engine at /api/psd — no API keys, no external AI services.
 */
import {
  FileText,
  Mountain,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import PSDMarkdown from './PSDMarkdown';

interface WidgetMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

const STORAGE_KEY = 'psd-chat-history-v1';

const WELCOME: WidgetMessage = {
  role: 'assistant',
  content:
    "Hey! 👋 I'm **PSD** — Webmers' built-in assistant.\n\nI'm trained **only on this site's content** and run **100% offline — no API keys needed**. Ask me about listings, prices, buying, the visual editor, selling, refunds, support and more!",
};

const SUGGESTIONS = [
  'What is Webmers?',
  'How do I buy a website?',
  'Show me listings under ₹200',
  'How does the refund policy work?',
  'How do I sell my website?',
  'What is the code unlock add-on?',
];

export default function PSDWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>(() => {
    if (typeof window === 'undefined') return [WELCOME];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WidgetMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return [WELCOME];
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist conversation
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const sendMessage = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? input).trim();
      if (!text || loading) return;

      setInput('');
      const userMsg: WidgetMessage = { role: 'user', content: text };
      const history = messages
        .filter((m) => m.role === 'user' || m.content !== WELCOME.content)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await fetch('/api/psd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history }),
        });
        const data = await res.json();
        const reply: WidgetMessage = {
          role: 'assistant',
          content: data.reply || 'Sorry, I could not think of a reply. Try again!',
          sources: Array.isArray(data.sources) ? data.sources : [],
        };
        setMessages((prev) => [...prev, reply]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Hmm, I hit a connection hiccup! 😅 Please try again in a moment.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages],
  );

  const clearChat = useCallback(() => {
    setMessages([WELCOME]);
  }, []);

  const isEditorPage = pathname?.startsWith('/editor');
  if (isEditorPage) return null;

  return (
    <>
      {/* ------------------------------ Launcher ------------------------------ */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open PSD chat assistant"
          className="group fixed bottom-5 right-5 z-[110] flex items-center gap-2.5 rounded-full border border-white/10 bg-gradient-to-b from-[#2a3b45] to-[#1a2730] py-2 pl-2 pr-5 text-white shadow-[0_14px_36px_rgba(22,30,38,0.35),0_4px_12px_rgba(22,30,38,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(22,30,38,0.42),0_6px_16px_rgba(22,30,38,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] md:bottom-6 md:right-6"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-wander-orange to-[#c4651f] shadow-[0_4px_14px_rgba(217,119,43,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105">
            <Mountain size={19} className="text-white" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#1a2730] bg-emerald-400" />
            </span>
          </span>
          <span className="text-left">
            <span className="block font-heading text-[15px] font-bold uppercase leading-none tracking-[0.22em]">
              PSD
            </span>
            <span className="mt-1 block text-[10px] font-medium leading-none text-white/55">
              Ask anything about Webmers
            </span>
          </span>
          <Sparkles size={14} className="ml-1 text-wander-orange/80" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close PSD chat assistant"
          className="fixed bottom-5 right-5 z-[110] flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-gradient-to-b from-[#2a3b45] to-[#1a2730] text-white shadow-[0_14px_36px_rgba(22,30,38,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 md:bottom-6 md:right-6"
        >
          <X size={20} />
        </button>
      )}

      {/* ------------------------------ Chat panel ----------------------------- */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[110] flex w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[28px] border border-wander-dark/10 bg-gradient-to-b from-[#fffdf9] to-[#f6f0e8] shadow-[0_20px_60px_rgba(143,113,80,0.22),0_8px_24px_rgba(143,113,80,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl animate-fade-up md:right-6"
          style={{ maxHeight: 'min(620px, calc(100dvh - 7.5rem))' }}
          role="dialog"
          aria-label="PSD chat assistant"
        >
          {/* Decorative clay backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 12% 6%, rgba(217,119,43,0.06) 0%, transparent 55%), radial-gradient(ellipse at 95% 100%, rgba(123,181,204,0.12) 0%, transparent 55%)',
            }}
          />

          {/* Header */}
          <div className="relative flex items-center gap-3 bg-gradient-to-br from-[#2a3b45] to-[#1a2730] px-5 py-4 text-white">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at 85% -20%, rgba(217,119,43,0.35) 0%, transparent 60%)',
              }}
            />
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-wander-orange to-[#c4651f] shadow-[0_4px_14px_rgba(217,119,43,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]">
              <Mountain size={20} />
            </div>
            <div className="relative min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold uppercase leading-none tracking-[0.2em]">
                  PSD
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </div>
              <p className="mt-1.5 truncate text-[11px] leading-none text-white/55">
                Webmers assistant · offline · no API keys
              </p>
            </div>
            <div className="relative ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                aria-label="Clear chat"
                title="Clear chat"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="relative flex-1 space-y-3.5 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
            style={{ scrollbarWidth: 'thin' }}
          >
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-[20px] rounded-br-[6px] bg-gradient-to-br from-wander-orange to-[#c4651f] px-4 py-2.5 text-white shadow-[0_5px_16px_rgba(217,119,43,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]">
                    <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed">
                      {m.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-wander-orange/30 bg-wander-orange/15 font-heading text-[11px] font-bold text-wander-orange">
                    P
                  </div>
                  <div className="max-w-[86%] rounded-[20px] rounded-bl-[6px] border border-wander-dark/10 bg-white/95 px-4 py-3 text-wander-text shadow-[0_2px_10px_rgba(143,113,80,0.07),inset_0_1px_0_rgba(255,255,255,0.85)]">
                    <PSDMarkdown text={m.content} />
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-wander-dark/5 pt-2.5">
                        {m.sources.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 rounded-full border border-wander-blue/40 bg-wander-blue/15 px-2 py-0.5 text-[10px] font-semibold text-wander-dark/80"
                          >
                            <FileText size={9} />
                            {s.replace(/^Listing: /, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-wander-orange/30 bg-wander-orange/15 font-heading text-[11px] font-bold text-wander-orange">
                  P
                </div>
                <div className="flex items-center gap-1.5 rounded-[20px] rounded-bl-[6px] border border-wander-dark/10 bg-white/95 px-4 py-3.5 shadow-[0_2px_10px_rgba(143,113,80,0.07)]">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-2 w-2 animate-bounce rounded-full bg-wander-orange"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length <= 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="clay-pill cursor-pointer px-3 py-1.5 text-[11.5px] text-wander-dark/80 transition-all hover:-translate-y-0.5 hover:text-wander-orange"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="relative border-t border-wander-dark/10 bg-white/70 px-3.5 py-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-wander-dark/10 bg-white/95 py-1.5 pl-4 pr-1.5 shadow-[inset_0_2px_6px_rgba(143,113,80,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors focus-within:border-wander-orange/40 focus-within:shadow-[inset_0_2px_6px_rgba(143,113,80,0.05),0_0_0_3px_rgba(217,119,43,0.1)]">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask PSD about Webmers..."
                maxLength={4000}
                aria-label="Message PSD"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-wander-dark outline-none placeholder:text-wander-dark/35"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-wander-orange to-[#c4651f] text-white shadow-[0_4px_14px_rgba(217,119,43,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-wander-dark/40">
              ⚡ Trained on Webmers content · runs 100% offline
            </p>
          </form>
        </div>
      )}
    </>
  );
}
