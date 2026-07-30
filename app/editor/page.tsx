'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Home,
  Image as ImageIcon,
  LayoutTemplate,
  Monitor,
  Palette,
  Redo,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Undo,
} from 'lucide-react';

type Device = 'desktop' | 'tablet' | 'mobile';
type Theme = 'Night' | 'Dawn' | 'Day';

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

const SECTIONS = ['Hero', 'Stats', 'Featured', 'Footer'] as const;
type Section = (typeof SECTIONS)[number];

const ACCENTS = ['#ffffff', '#f59e0b', '#f43f5e', '#10b981', '#8b5cf6'];
const FONTS: Record<string, string> = {
  Inter: 'font-sans',
  'Space Grotesk': 'font-display',
  Serif: 'font-serif',
};

export default function EditorPage() {
  const [device, setDevice] = useState<Device>('desktop');
  const [theme, setTheme] = useState<Theme>('Night');
  const [accent, setAccent] = useState('#ffffff');
  const [font, setFont] = useState<keyof typeof FONTS>('Inter');
  const [visible, setVisible] = useState<Record<Section, boolean>>({
    Hero: true,
    Stats: true,
    Featured: true,
    Footer: true,
  });
  const [toast, setToast] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const isDay = theme === 'Day';
  const previewText = isDay ? 'text-black' : 'text-white';
  const previewMuted = isDay ? 'text-black/50' : 'text-white/50';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Toolbar */}
      <header className="h-16 border-b border-white/10 bg-gradient-to-r from-[#0a0a0a] via-[#0f0f12] to-[#0a0a0a] flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
        <div className="flex items-center gap-4 md:gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors shrink-0" aria-label="Back to home">
            <Home size={18} />
          </Link>
          <h1 className="font-display text-lg md:text-xl font-bold truncate">Visual Editor</h1>
          <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-xl px-1.5 py-1 border border-white/10">
            <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')} label="Desktop"><Monitor size={17} /></DeviceButton>
            <DeviceButton active={device === 'tablet'} onClick={() => setDevice('tablet')} label="Tablet"><Tablet size={17} /></DeviceButton>
            <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')} label="Mobile"><Smartphone size={17} /></DeviceButton>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={() => showToast('Nothing to undo')} className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Undo size={16} /> Undo
          </button>
          <button onClick={() => showToast('Nothing to redo')} className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Redo size={16} /> Redo
          </button>
          <button
            onClick={() => {
              setSavedAt(new Date());
              showToast('Changes saved · Version 1');
            }}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            <Save size={16} /> {savedAt ? `Saved v${savedAt.getMinutes() + 1}` : 'Save'}
          </button>
          <button
            onClick={() => showToast('🎉 Site published successfully')}
            className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:scale-[1.02] transition-transform"
          >
            Publish
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Components panel */}
        <aside className="hidden lg:block w-64 border-r border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-y-auto shrink-0">
          <div className="p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-4">Sections</h2>
            <div className="space-y-2">
              {SECTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setVisible((v) => ({ ...v, [s]: !v[s] }))}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    visible[s]
                      ? 'bg-white/[0.06] border-white/20'
                      : 'bg-transparent border-white/[0.06] opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{s}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${visible[s] ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
                      {visible[s] ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-6 text-xs text-white/25 leading-relaxed">
              Toggle sections, switch theme & device, then click any text in the canvas to edit it inline.
            </p>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#080808] relative">
          <div className={`${DEVICE_WIDTH[device]} mx-auto my-6 min-h-[80vh] shadow-[0_0_120px_-40px_rgba(255,255,255,0.08)] ${FONTS[font]} transition-all duration-300 rounded-xl overflow-hidden border border-white/5`}>
            {/* Hero */}
            {visible.Hero && (
              <section className={`relative min-h-[60vh] flex flex-col items-center justify-center px-8 py-16 overflow-hidden group ${THEME_BG[theme]}`}>
                <div className="relative z-10 text-center">
                  <h2 className={`text-4xl md:text-6xl font-bold tracking-tight mb-5 ${previewText} cursor-text`} contentEditable suppressContentEditableWarning>
                    Buy. Edit. Own.
                  </h2>
                  <p className={`text-lg md:text-xl ${previewMuted} font-light mb-8 max-w-xl mx-auto cursor-text`} contentEditable suppressContentEditableWarning>
                    The premium marketplace for fully-built websites.
                  </p>
                  <button
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium hover:scale-[1.02] transition-transform"
                    style={{ backgroundColor: accent, color: accent === '#ffffff' ? '#000' : '#fff' }}
                  >
                    Get Started
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => showToast('Edit section settings')} className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white/70 transition-colors" aria-label="Edit section"><Type size={15} /></button>
                  <button onClick={() => setVisible((v) => ({ ...v, Hero: false }))} className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-rose-300 transition-colors" aria-label="Hide section"><Trash2 size={15} /></button>
                </div>
              </section>
            )}

            {/* Stats */}
            {visible.Stats && (
              <section className={`relative px-6 py-12 ${isDay ? 'bg-white/40' : 'bg-white/[0.02]'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    { label: 'Websites Sold', value: '0' },
                    { label: 'Users', value: '0' },
                    { label: 'Earned by Sellers', value: '$0' },
                    { label: 'Average Rating', value: '0.0★' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className={`text-2xl md:text-4xl font-bold mb-1 ${previewText}`} contentEditable suppressContentEditableWarning>{s.value}</div>
                      <div className={`text-xs ${previewMuted}`} contentEditable suppressContentEditableWarning>{s.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Featured */}
            {visible.Featured && (
              <section className={`px-6 py-12 ${isDay ? 'bg-white/20' : ''}`}>
                <h3 className={`text-2xl md:text-3xl font-bold mb-6 ${previewText}`} contentEditable suppressContentEditableWarning>Featured Websites</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { title: 'Meridian SaaS', price: '$299' },
                    { title: 'Nocturne Portfolio', price: '$149' },
                    { title: 'Lumina E-commerce', price: '$399' },
                  ].map((site) => (
                    <div key={site.title} className={`p-5 rounded-2xl border ${isDay ? 'bg-white/50 border-black/10' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                      <div className="h-20 rounded-xl mb-4" style={{ backgroundImage: `linear-gradient(135deg, ${accent === '#ffffff' ? '#f59e0b' : accent}, #f43f5e)` }} />
                      <div className={`font-bold ${previewText}`} contentEditable suppressContentEditableWarning>{site.title}</div>
                      <div className={`text-sm ${previewMuted}`}>{site.price}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            {visible.Footer && (
              <footer className={`px-6 py-10 ${isDay ? 'bg-[#87CEEB] text-black' : 'bg-black/40 text-white'}`}>
                <div className="font-display text-xl font-bold mb-2" contentEditable suppressContentEditableWarning>Webmers</div>
                <p className={isDay ? 'text-black/50 text-sm' : 'text-white/40 text-sm'} contentEditable suppressContentEditableWarning>
                  Buy. Edit. Own. The premium marketplace for fully-built websites.
                </p>
              </footer>
            )}
          </div>
        </main>

        {/* Properties panel */}
        <aside className="hidden md:block w-64 border-l border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-y-auto shrink-0">
          <div className="p-5 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/20">Properties</h2>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Background Theme</label>
              <div className="flex gap-2">
                {(['Night', 'Dawn', 'Day'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 px-2 py-2 rounded-lg border text-xs transition-colors ${
                      theme === t ? 'bg-white/10 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Typography</label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value as keyof typeof FONTS)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 focus:outline-none"
              >
                {Object.keys(FONTS).map((f) => (
                  <option key={f} value={f} className="bg-[#0a0a0a]">{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Accent Color</label>
              <div className="flex gap-2">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${accent === c ? 'border-white' : 'border-white/20'}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Accent ${c}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Theme Presets</label>
              <div className="flex gap-2">
                {[
                  { name: 'Midnight', bg: 'from-[#02020a] via-[#0a0a14] to-[#121224]' },
                  { name: 'Sunset', bg: 'from-[#2a1a3a] via-[#7a3b5e] to-[#f0a868]' },
                  { name: 'Morning', bg: 'from-[#87CEEB] via-[#b0e2ff] to-[#e8f6ff]' },
                ].map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setTheme(p.name === 'Midnight' ? 'Night' : p.name === 'Sunset' ? 'Dawn' : 'Day')}
                    className={`flex-1 px-2 py-2 rounded-lg border text-[10px] transition-colors ${theme === (p.name === 'Midnight' ? 'Night' : p.name === 'Sunset' ? 'Dawn' : 'Day') ? 'bg-white/10 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Component Toggle</label>
              <div className="flex gap-2">
                {['Header', 'Footer', 'Sections', 'CTAs'].map((c) => (
                  <button
                    key={c}
                    onClick={() => showToast(`${c} toggled`)}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/60 hover:text-white hover:border-white/20 transition-all"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Quick Add</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Text', icon: Type },
                  { label: 'Image', icon: ImageIcon },
                  { label: 'Layout', icon: LayoutTemplate },
                  { label: 'Palette', icon: Palette },
                ].map((c) => (
                  <button
                    key={c.label}
                    onClick={() => showToast(`${c.label} block added`)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 text-sm text-white/60 hover:text-white transition-all"
                  >
                    <c.icon size={15} /> {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/30">
              <Eye size={14} /> {device} · {theme}
            </div>
            <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="text-[10px] uppercase tracking-widest text-white/20 mb-2">Version History</div>
              <div className="space-y-1.5">
                {['v3 — Current', 'v2 — 5 min ago', 'v1 — 12 min ago'].map((v) => (
                  <button
                    key={v}
                    onClick={() => showToast(`Rollback to ${v}`)}
                    className={`w-full text-left text-[11px] rounded-lg px-2 py-1 transition-colors ${v.includes('Current') ? 'bg-emerald-400/10 text-emerald-200' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-white text-black text-sm font-medium shadow-2xl animate-fade-up">
          {toast}
        </div>
      )}
    </div>
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
      className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
    >
      {children}
    </button>
  );
}
