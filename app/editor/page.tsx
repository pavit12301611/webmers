import { Save, Undo, Redo, Eye, Smartphone, Monitor, Trash2, Type, Image, Palette, LayoutTemplate } from 'lucide-react';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-white/10 bg-gradient-to-r from-[#0a0a0a] via-[#0f0f12] to-[#0a0a0a] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-xl font-bold">Visual Editor</h1>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-2 py-1 border border-white/10">
            <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors" aria-label="Desktop preview"><Monitor size={18} /></button>
            <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors" aria-label="Tablet preview"><LayoutTemplate size={18} /></button>
            <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors" aria-label="Mobile preview"><Smartphone size={18} /></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all" aria-label="Undo"><Undo size={16} /> Undo</button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all" aria-label="Redo"><Redo size={16} /> Redo</button>
          <div className="h-6 w-px bg-white/10 mx-1" />
          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" aria-label="Save"><Save size={16} /> Auto-Saved</button>
          <button className="px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:scale-[1.02] transition-transform">Publish</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Component Panel */}
        <aside className="w-72 border-r border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-y-auto shrink-0">
          <div className="p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-4">Components</h2>
            <div className="space-y-2">
              {[
                { label: 'Hero Section', icon: LayoutTemplate, desc: 'Full-width hero with background' },
                { label: 'Text Block', icon: Type, desc: 'Rich text content area' },
                { label: 'Image Gallery', icon: Image, desc: 'Grid or carousel' },
                { label: 'Features Grid', icon: Palette, desc: 'Icon + text cards' },
                { label: 'Call to Action', icon: Eye, desc: 'Button + headline' },
              ].map((c) => (
                <button key={c.label} className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] hover:border-white/20 hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-center gap-3 mb-1">
                    <c.icon size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
                    <span className="font-medium text-sm">{c.label}</span>
                  </div>
                  <span className="text-xs text-white/20 group-hover:text-white/30">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 overflow-y-auto bg-[#080808] relative">
          <div className="max-w-4xl mx-auto min-h-screen shadow-[0_0_120px_-40px_rgba(255,255,255,0.05)] bg-gradient-to-b from-[#0f0f12] to-[#050505]">
            {/* Editable Hero */}
            <section className="relative h-[70vh] flex flex-col items-center justify-center px-8 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] via-[#0a0a14] to-[#121224] z-0" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1),_transparent_70%)]" />
              <div className="relative z-10 text-center">
                <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 text-white group-hover:scale-[1.01] transition-transform duration-700 cursor-text" contentEditable suppressContentEditableWarning>Buy. Edit. Own.</h2>
                <p className="text-xl md:text-2xl text-white/50 font-light mb-8 max-w-2xl mx-auto cursor-text" contentEditable suppressContentEditableWarning>The premium marketplace for fully-built websites.</p>
                <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-[1.02] transition-transform">Get Started</a>
              </div>
              {/* Inline edit indicators */}
              <div className="absolute bottom-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white/70 hover:text-white transition-colors" aria-label="Edit section"><Type size={16} /></button>
                <button className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-rose-300 hover:text-rose-400 transition-colors" aria-label="Delete section"><Trash2 size={16} /></button>
              </div>
            </section>

            {/* Editable Stats */}
            <section className="relative z-10 -mt-20 mx-4 md:mx-12 mb-20">
              <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] rounded-3xl p-8 md:p-12 grid md:grid-cols-4 gap-8 text-center">
                {[
                  { label: 'Websites Sold', value: '500+' },
                  { label: 'Users', value: '10,000+' },
                  { label: 'Earned by Sellers', value: '$2M+' },
                  { label: 'Average Rating', value: '4.9★' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl md:text-5xl font-display font-bold mb-2" contentEditable suppressContentEditableWarning>{s.value}</div>
                    <div className="text-sm text-white/30" contentEditable suppressContentEditableWarning>{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Editable Featured Websites */}
            <section className="px-6 md:px-16 max-w-7xl mx-auto mb-20">
              <div className="flex items-end justify-between mb-12">
                <h3 className="text-4xl font-display font-bold" contentEditable suppressContentEditableWarning>Featured Websites</h3>
                <a href="#" className="text-white/30 hover:text-white text-sm">View All →</a>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: 'Meridian SaaS', price: '$299', rating: '4.9', color: 'from-amber-500 to-rose-500' },
                  { title: 'Nocturne Portfolio', price: '$149', rating: '4.8', color: 'from-violet-500 to-fuchsia-500' },
                  { title: 'Lumina E-commerce', price: '$399', rating: '5.0', color: 'from-emerald-500 to-cyan-500' },
                ].map((site) => (
                  <a key={site.title} href="#" className="group block relative overflow-hidden rounded-3xl aspect-[4/5] border border-white/[0.08] hover:border-white/20 transition-all hover:-translate-y-1 shadow-xl shadow-black/50">
                    <div className={`absolute inset-0 bg-gradient-to-br ${site.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                    <img src={`https://picsum.photos/seed/${site.title}/600/750`} alt={site.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <h4 className="text-2xl font-display font-bold mb-2" contentEditable suppressContentEditableWarning>{site.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-white/50">
                        <span className="font-medium text-white">{site.price}</span>
                        <span>·</span>
                        <span>★ {site.rating}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Properties Panel */}
        <aside className="w-72 border-l border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-y-auto shrink-0">
          <div className="p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-4">Properties</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs text-white/40 mb-2 block">Background Theme</label>
                <div className="flex gap-2">
                  {['Night', 'Dawn', 'Day'].map((t) => (
                    <button key={t} className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors">{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block">Typography</label>
                <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 focus:outline-none">
                  <option>Inter</option>
                  <option>Space Grotesk</option>
                  <option>Satoshi</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block">Colors</label>
                <div className="flex gap-2">
                  {['#050505', '#fafafa', '#888888', '#e8cfa8', '#ffeb3b'].map((c) => (
                    <button key={c} className="w-8 h-8 rounded-full border border-white/20 hover:scale-110 transition-transform" style={{ backgroundColor: c }} aria-label={`Color ${c}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block">Components</label>
                <div className="space-y-2">
                  {['Hero', 'Stats', 'Features', 'Testimonials', 'Footer'].map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm text-white/50 hover:text-white cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-amber-400" /> {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
