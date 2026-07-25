'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Eye,
  Home,
  LayoutTemplate,
  Monitor,
  Redo,
  Save,
  Smartphone,
  Tablet,
  Type,
  Undo,
} from 'lucide-react';

type Device = 'desktop' | 'tablet' | 'mobile';
type Theme = 'Night' | 'Dawn' | 'Day';
type Section = 'Hero' | 'Stats' | 'Featured' | 'Footer';

export interface EditorDoc {
  theme: string;
  accent: string;
  font: string;
  sections: Record<string, boolean>;
  content: Record<string, string>;
  published: boolean;
}

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: 'max-w-4xl',
  tablet: 'max-w-[768px]',
  mobile: 'max-w-[375px]',
};

const THEME_BG: Record<Theme, string> = {
  Night: 'bg-gradient-to-b from-[#02020a] via-[#0a0a14] to-[#121224]',
  Dawn: 'bg-gradient-to-b from-[#2a1a3a] via-[#7a3b5e] to-[#f0a868]',
  Day: 'bg-gradient-to-b from-[#87CEEB] via-[#b0e2ff] to-[#e8f6ff]',
};

const SECTIONS: Section[] = ['Hero', 'Stats', 'Featured', 'Footer'];
const ACCENTS = ['#ffffff', '#f59e0b', '#f43f5e', '#10b981', '#8b5cf6'];
const FONT_CLASS: Record<string, string> = {
  Inter: 'font-sans',
  'Space Grotesk': 'font-display',
  Serif: 'font-serif',
};

/** Default copy for every editable region, keyed by a stable content id. */
const DEFAULT_CONTENT: Record<string, string> = {
  'hero.title': 'Buy. Edit. Own.',
  'hero.subtitle': 'The premium marketplace for fully-built websites.',
  'hero.cta': 'Get Started',
  'stats.0.value': '500+', 'stats.0.label': 'Websites Sold',
  'stats.1.value': '10,000+', 'stats.1.label': 'Users',
  'stats.2.value': '$2M+', 'stats.2.label': 'Earned by Sellers',
  'stats.3.value': '4.9★', 'stats.3.label': 'Average Rating',
  'featured.title': 'Featured Websites',
  'featured.0.title': 'Meridian SaaS', 'featured.0.price': '$299',
  'featured.1.title': 'Nocturne Portfolio', 'featured.1.price': '$149',
  'featured.2.title': 'Lumina E-commerce', 'featured.2.price': '$399',
  'footer.title': 'Webmers',
  'footer.text': 'Buy. Edit. Own. The premium marketplace for fully-built websites.',
};

const MAX_HISTORY = 50;

export default function EditorWorkspace({
  orderId,
  listingTitle,
  initialState,
  lastSavedAt,
}: {
  orderId: string;
  listingTitle: string;
  initialState: EditorDoc;
  lastSavedAt: string | null;
}) {
  const [device, setDevice] = useState<Device>('desktop');
  const [doc, setDoc] = useState<EditorDoc>(initialState);

  // Undo/redo stacks hold complete documents — simple and always consistent.
  const [past, setPast] = useState<EditorDoc[]>([]);
  const [future, setFuture] = useState<EditorDoc[]>([]);

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(lastSavedAt);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  /** Applies a change and records the previous document for undo. */
  const commit = useCallback((updater: (prev: EditorDoc) => EditorDoc) => {
    setDoc((prev) => {
      const next = updater(prev);
      if (JSON.stringify(next) === JSON.stringify(prev)) return prev;
      setPast((p) => [...p, prev].slice(-MAX_HISTORY));
      setFuture([]);
      setDirty(true);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) {
        showToast('Nothing to undo');
        return p;
      }
      const previous = p[p.length - 1];
      setDoc((current) => {
        setFuture((f) => [current, ...f].slice(0, MAX_HISTORY));
        return previous;
      });
      setDirty(true);
      return p.slice(0, -1);
    });
  }, [showToast]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) {
        showToast('Nothing to redo');
        return f;
      }
      const next = f[0];
      setDoc((current) => {
        setPast((p) => [...p, current].slice(-MAX_HISTORY));
        return next;
      });
      setDirty(true);
      return f.slice(1);
    });
  }, [showToast]);

  const save = useCallback(
    async (overrides?: Partial<EditorDoc>, message = 'Changes saved') => {
      if (saving) return;
      setSaving(true);
      try {
        const payload = { ...doc, ...overrides, orderId };
        const res = await fetch('/api/editor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          showToast(data.error || 'Could not save. Please try again.');
          return;
        }
        if (overrides) setDoc((prev) => ({ ...prev, ...overrides }));
        setSavedAt(data.state?.updatedAt ?? new Date().toISOString());
        setDirty(false);
        showToast(message);
      } catch {
        showToast('Network error — your changes are still here, try saving again.');
      } finally {
        setSaving(false);
      }
    },
    [doc, orderId, saving, showToast],
  );

  // Warn before navigating away with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Keyboard shortcuts: Cmd/Ctrl+S, Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        void save();
      } else if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, undo, redo]);

  const text = useCallback(
    (key: string) => doc.content[key] ?? DEFAULT_CONTENT[key] ?? '',
    [doc.content],
  );

  const setText = useCallback(
    (key: string, value: string) => {
      const clean = value.replace(/\s+/g, ' ').trim().slice(0, 500);
      if (clean === text(key)) return;
      commit((prev) => ({ ...prev, content: { ...prev.content, [key]: clean } }));
    },
    [commit, text],
  );

  const theme = (THEME_BG[doc.theme as Theme] ? doc.theme : 'Night') as Theme;
  const isDay = theme === 'Day';
  const previewText = isDay ? 'text-black' : 'text-white';
  const previewMuted = isDay ? 'text-black/50' : 'text-white/50';
  const fontClass = FONT_CLASS[doc.font] ?? 'font-sans';
  const visible = doc.sections;

  const savedLabel = useMemo(() => {
    if (dirty) return 'Unsaved changes';
    if (!savedAt) return 'Not saved yet';
    return `Saved ${new Date(savedAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }, [dirty, savedAt]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      {/* Toolbar */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#0a0a0a] via-[#0f0f12] to-[#0a0a0a] px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Link
            href="/dashboard/buyer"
            className="shrink-0 text-white/50 transition-colors hover:text-white"
            aria-label="Back to dashboard"
          >
            <Home size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold md:text-xl">
              {listingTitle}
            </h1>
            <p className="truncate text-[11px] text-white/35">{savedLabel}</p>
          </div>
          <div className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-1.5 py-1 sm:flex">
            <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')} label="Desktop"><Monitor size={17} /></DeviceButton>
            <DeviceButton active={device === 'tablet'} onClick={() => setDevice('tablet')} label="Tablet"><Tablet size={17} /></DeviceButton>
            <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')} label="Mobile"><Smartphone size={17} /></DeviceButton>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent md:flex"
          >
            <Undo size={16} /> Undo
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent md:flex"
          >
            <Redo size={16} /> Redo
          </button>
          <button
            onClick={() => void save()}
            disabled={saving || !dirty}
            className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:opacity-40 md:px-4"
          >
            {dirty ? <Save size={16} /> : <Check size={16} />}
            {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
          </button>
          <button
            onClick={() => void save({ published: true }, '🎉 Site published')}
            disabled={saving}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.02] disabled:opacity-50 md:px-5"
          >
            {doc.published ? 'Republish' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sections panel */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#050505] lg:block">
          <div className="p-5">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/25">Sections</h2>
            <div className="space-y-2">
              {SECTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    commit((prev) => ({
                      ...prev,
                      sections: { ...prev.sections, [s]: !prev.sections[s] },
                    }))
                  }
                  aria-pressed={!!visible[s]}
                  className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                    visible[s]
                      ? 'border-white/20 bg-white/[0.06]'
                      : 'border-white/[0.06] bg-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        visible[s] ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {visible[s] ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-white/25">
              Click any text in the canvas to edit it. Changes are kept in your account —
              <kbd className="mx-1 rounded bg-white/10 px-1">⌘S</kbd> to save,
              <kbd className="mx-1 rounded bg-white/10 px-1">⌘Z</kbd> to undo.
            </p>
          </div>
        </aside>

        {/* Canvas */}
        <main className="relative flex-1 overflow-y-auto bg-[#080808]">
          <div
            className={`${DEVICE_WIDTH[device]} mx-auto my-6 min-h-[80vh] overflow-hidden rounded-xl border border-white/5 shadow-[0_0_120px_-40px_rgba(255,255,255,0.08)] transition-all duration-300 ${fontClass}`}
          >
            {visible.Hero && (
              <section
                className={`relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-8 py-16 ${THEME_BG[theme]}`}
              >
                <div className="relative z-10 text-center">
                  <Editable
                    as="h2"
                    value={text('hero.title')}
                    onCommit={(v) => setText('hero.title', v)}
                    className={`mb-5 text-4xl font-bold tracking-tight md:text-6xl ${previewText}`}
                  />
                  <Editable
                    as="p"
                    value={text('hero.subtitle')}
                    onCommit={(v) => setText('hero.subtitle', v)}
                    className={`mx-auto mb-8 max-w-xl text-lg font-light md:text-xl ${previewMuted}`}
                  />
                  <Editable
                    as="span"
                    value={text('hero.cta')}
                    onCommit={(v) => setText('hero.cta', v)}
                    className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-medium"
                    style={{ backgroundColor: doc.accent, color: doc.accent === '#ffffff' ? '#000' : '#fff' }}
                  />
                </div>
              </section>
            )}

            {visible.Stats && (
              <section className={`relative px-6 py-12 ${isDay ? 'bg-white/40' : 'bg-white/[0.02]'}`}>
                <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i}>
                      <Editable
                        as="div"
                        value={text(`stats.${i}.value`)}
                        onCommit={(v) => setText(`stats.${i}.value`, v)}
                        className={`mb-1 text-2xl font-bold md:text-4xl ${previewText}`}
                      />
                      <Editable
                        as="div"
                        value={text(`stats.${i}.label`)}
                        onCommit={(v) => setText(`stats.${i}.label`, v)}
                        className={`text-xs ${previewMuted}`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {visible.Featured && (
              <section className={`px-6 py-12 ${isDay ? 'bg-white/20' : ''}`}>
                <Editable
                  as="h3"
                  value={text('featured.title')}
                  onCommit={(v) => setText('featured.title', v)}
                  className={`mb-6 text-2xl font-bold md:text-3xl ${previewText}`}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`rounded-2xl border p-5 ${
                        isDay ? 'border-black/10 bg-white/50' : 'border-white/[0.08] bg-white/[0.03]'
                      }`}
                    >
                      <div
                        className="mb-4 h-20 rounded-xl"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${
                            doc.accent === '#ffffff' ? '#f59e0b' : doc.accent
                          }, #f43f5e)`,
                        }}
                      />
                      <Editable
                        as="div"
                        value={text(`featured.${i}.title`)}
                        onCommit={(v) => setText(`featured.${i}.title`, v)}
                        className={`font-bold ${previewText}`}
                      />
                      <Editable
                        as="div"
                        value={text(`featured.${i}.price`)}
                        onCommit={(v) => setText(`featured.${i}.price`, v)}
                        className={`text-sm ${previewMuted}`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {visible.Footer && (
              <footer className={`px-6 py-10 ${isDay ? 'bg-[#87CEEB] text-black' : 'bg-black/40 text-white'}`}>
                <Editable
                  as="div"
                  value={text('footer.title')}
                  onCommit={(v) => setText('footer.title', v)}
                  className="mb-2 font-display text-xl font-bold"
                />
                <Editable
                  as="p"
                  value={text('footer.text')}
                  onCommit={(v) => setText('footer.text', v)}
                  className={isDay ? 'text-sm text-black/50' : 'text-sm text-white/40'}
                />
              </footer>
            )}
          </div>
        </main>

        {/* Properties panel */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#050505] md:block">
          <div className="space-y-6 p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/25">Properties</h2>

            <div>
              <span className="mb-2 block text-xs text-white/40">Background Theme</span>
              <div className="flex gap-2">
                {(['Night', 'Dawn', 'Day'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => commit((prev) => ({ ...prev, theme: t }))}
                    aria-pressed={theme === t}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs transition-colors ${
                      theme === t
                        ? 'border-white/40 bg-white/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="editor-font" className="mb-2 block text-xs text-white/40">
                Typography
              </label>
              <select
                id="editor-font"
                value={doc.font}
                onChange={(e) => commit((prev) => ({ ...prev, font: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-white/30"
              >
                {Object.keys(FONT_CLASS).map((f) => (
                  <option key={f} value={f} className="bg-[#0a0a0a]">{f}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-2 block text-xs text-white/40">Accent Color</span>
              <div className="flex gap-2">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => commit((prev) => ({ ...prev, accent: c }))}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      doc.accent === c ? 'border-white' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Accent ${c}`}
                    aria-pressed={doc.accent === c}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-white/[0.06] pt-4 text-xs text-white/30">
              <p className="flex items-center gap-2">
                <Eye size={13} /> {device} · {theme}
              </p>
              <p className="flex items-center gap-2">
                <LayoutTemplate size={13} />{' '}
                {SECTIONS.filter((s) => visible[s]).length} of {SECTIONS.length} sections visible
              </p>
              {doc.published && (
                <p className="flex items-center gap-2 text-emerald-400/70">
                  <Check size={13} /> Published
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="animate-fade-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-2xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/**
 * Inline-editable text. Commits on blur so a single edit is one undo step,
 * and keeps React as the source of truth for the value.
 */
function Editable({
  as: Tag = 'div',
  value,
  onCommit,
  className = '',
  style,
}: {
  as?: 'div' | 'p' | 'h2' | 'h3' | 'span';
  value: string;
  onCommit: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  // Keep the DOM in sync when the value changes externally (undo/redo).
  useEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== value && document.activeElement !== el) {
      el.textContent = value;
    }
  }, [value]);

  return (
    <Tag
      ref={ref as never}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      aria-label="Editable text"
      spellCheck={false}
      onBlur={(e: React.FocusEvent<HTMLElement>) => onCommit(e.currentTarget.textContent ?? '')}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === 'Escape') {
          e.currentTarget.textContent = value;
          e.currentTarget.blur();
        }
      }}
      className={`cursor-text rounded outline-none ring-offset-2 transition-shadow focus:ring-2 focus:ring-sky-400/70 ${className}`}
      style={style}
    >
      {value}
    </Tag>
  );
}

function DeviceButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label} preview`}
      aria-pressed={active}
      className={`rounded-lg p-1.5 transition-colors ${
        active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
