'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mountain, Send, Sparkles, X, Wand2, Loader2, Code, Palette, Type, LayoutTemplate } from 'lucide-react';
import { EditorAction, EditorState } from '@/lib/editorAI/types';
import PSDMarkdown from './PSDMarkdown';

interface EditorAIMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: EditorAction[];
}

interface Props {
  editorState: EditorState;
  onApplyActions: (actions: EditorAction[]) => void;
}

const QUICK_PROMPTS = [
  { label: 'Add pricing section', prompt: 'Add a pricing section with 3 plans' },
  { label: 'Dark theme', prompt: 'Set theme to dark' },
  { label: 'Orange accent', prompt: 'Make accent orange' },
  { label: 'Change title', prompt: 'Change hero title to Welcome to Our Creative Studio' },
  { label: 'Add Services page', prompt: 'Add page Services' },
  { label: 'Mobile preview', prompt: 'Show mobile preview' },
];

const SYSTEM_WELCOME: EditorAIMessage = {
  role: 'assistant',
  content: `Hey! I'm **PSD** — now connected to your visual editor ✨

Just type what you want and I'll edit the site live. For example:

- "Add a pricing section"
- "Change hero title to Build Amazing Things"
- "Make theme dark and accent blue"
- "Add page Services with team and portfolio"
- "Remove the newsletter section"
- "Set site title to Neon Agency"

No coding needed — I translate natural language into site edits instantly.`,
};

export default function EditorAI({ editorState, onApplyActions }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<EditorAIMessage[]>([SYSTEM_WELCOME]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = useCallback(async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: EditorAIMessage = { role: 'user', content: text };
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/editor-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          editorState: {
            pages: editorState.pages,
            activePageId: editorState.activePageId,
            selectedSectionId: editorState.selectedSectionId,
            themeKey: editorState.themeKey,
            accent: editorState.accent,
            font: editorState.font,
            siteTitle: editorState.siteTitle,
          },
        }),
      });
      const data = await res.json();
      const assistantMsg: EditorAIMessage = {
        role: 'assistant',
        content: data.reply || 'Done!',
        actions: data.actions || [],
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (data.actions && data.actions.length > 0) {
        // Small delay so user sees reply, then apply
        setTimeout(() => {
          onApplyActions(data.actions);
        }, 150);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Connection hiccup — try again in a moment!' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, editorState, onApplyActions]);

  return (
    <>
      {/* Launcher - PSD style but editor specific */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open PSD editor AI"
          className="group fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 rounded-full border border-white/10 bg-gradient-to-b from-[#1f3d47] to-[#121a1f] py-2 pl-2 pr-5 text-white shadow-[0_14px_36px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.42)] md:bottom-6 md:right-[22rem]"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#d9772b] to-[#b85e1f] shadow-[0_4px_14px_rgba(217,119,43,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105">
            <Wand2 size={18} className="text-white" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#1a2730] bg-emerald-400" />
            </span>
          </span>
          <span className="text-left">
            <span className="block font-heading text-[14px] font-bold uppercase leading-none tracking-[0.18em]">PSD • EDITOR</span>
            <span className="mt-1 block text-[10px] font-medium leading-none text-white/60">Type to edit the site live</span>
          </span>
          <Sparkles size={14} className="ml-1 text-[#d9772b]/90" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close PSD editor AI"
          className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-gradient-to-b from-[#1f3d47] to-[#121a1f] text-white shadow-[0_14px_36px_rgba(0,0,0,0.35)] transition-all md:bottom-6 md:right-[22rem]"
        >
          <X size={20} />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-24 right-5 z-[60] flex w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[28px] border border-[#1f3d47]/15 bg-gradient-to-b from-white to-[#f3efe8] shadow-[0_20px_60px_rgba(31,61,71,0.22),0_8px_24px_rgba(31,61,71,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl md:right-[22rem]"
          style={{ maxHeight: 'min(640px, calc(100dvh - 7.5rem))' }}
          role="dialog"
          aria-label="PSD visual editor AI"
        >
          {/* Header */}
          <div className="relative flex items-center gap-3 bg-gradient-to-br from-[#1f3d47] to-[#121a1f] px-5 py-4 text-white">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#d9772b] to-[#b85e1f] shadow-[0_4px_14px_rgba(217,119,43,0.4)]">
              <Mountain size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading text-[15px] font-bold uppercase tracking-[0.18em]">PSD Editor</span>
                <span className="rounded-full bg-[#d9772b]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#ffbf86] border border-[#d9772b]/30">Live</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </div>
              <p className="mt-1 truncate text-[11px] leading-none text-white/60">
                Connected to visual editor • offline • no API keys
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setMessages([SYSTEM_WELCOME])}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                title="Clear chat"
              >
                <Code size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Context bar */}
          <div className="flex items-center gap-2 border-b border-[#1f3d47]/10 bg-[#f3efe8]/60 px-4 py-2 text-[10px] font-medium text-[#1f3d47]/60">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#1f3d47]/10 px-2 py-0.5">
              <LayoutTemplate size={10} /> {editorState.pages.find(p=>p.id===editorState.activePageId)?.name || editorState.activePageId}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#1f3d47]/10 px-2 py-0.5">
              <Palette size={10} /> {editorState.themeKey}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#1f3d47]/10 px-2 py-0.5">
              <Type size={10} /> {editorState.font}
            </span>
            <span className="ml-auto hidden sm:inline">{editorState.pages.length} pages • {editorState.pages.reduce((a,p)=>a+p.sections.length,0)} blocks</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-[20px] rounded-br-[6px] bg-[#1f3d47] px-4 py-2.5 text-white shadow">
                    <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d9772b]/30 bg-[#d9772b]/15 font-heading text-[11px] font-bold text-[#d9772b]">P</div>
                  <div className="max-w-[86%] rounded-[20px] rounded-bl-[6px] border border-[#1f3d47]/10 bg-white/95 px-4 py-3 text-[#1f3d47] shadow-[0_2px_10px_rgba(31,61,71,0.07)]">
                    <PSDMarkdown text={m.content} />
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-[#1f3d47]/5 pt-2.5">
                        {m.actions.map((a, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            ✓ {a.type.replace(/([A-Z])/g, ' $1')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d9772b]/30 bg-[#d9772b]/15 font-heading text-[11px] font-bold text-[#d9772b]">P</div>
                <div className="flex items-center gap-1.5 rounded-[20px] rounded-bl-[6px] border border-[#1f3d47]/10 bg-white/95 px-4 py-3.5 shadow-[0_2px_10px_rgba(31,61,71,0.07)]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#d9772b]" />
                  <span className="text-xs text-[#1f3d47]/60">Editing live site...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="border-t border-[#1f3d47]/10 bg-[#f3efe8]/70 px-3 py-2.5">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(q => (
                <button
                  key={q.label}
                  onClick={() => send(q.prompt)}
                  className="rounded-full border border-[#1f3d47]/10 bg-white px-2.5 py-1 text-[11px] font-medium text-[#1f3d47]/70 transition hover:border-[#d9772b]/30 hover:text-[#d9772b]"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); send(); }}
            className="border-t border-[#1f3d47]/10 bg-white/80 px-3.5 py-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-[#1f3d47]/10 bg-white py-1.5 pl-4 pr-1.5 shadow-[inset_0_2px_6px_rgba(31,61,71,0.06)] focus-within:border-[#d9772b]/40 focus-within:shadow-[0_0_0_3px_rgba(217,119,43,0.1)]">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder='Ask PSD to edit — "Add pricing with 3 plans"'
                maxLength={800}
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[#1f3d47] outline-none placeholder:text-[#1f3d47]/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9772b] text-white shadow-[0_4px_14px_rgba(217,119,43,0.35)] transition hover:scale-105 disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-[#1f3d47]/40">
              PSD edits live • no API keys • 100% offline parser
            </p>
          </form>
        </div>
      )}
    </>
  );
}
