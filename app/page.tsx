'use client';

import { ArrowDown, Heart, Star, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Night Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Sky gradient — night at top */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] via-[#0a0a14] to-[#121224] z-0" />
        
        {/* Stars */}
        <Stars />
        
        {/* Glowing Moon */}
        <div className="absolute top-[15vh] right-[15vw] w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#fdf6e3] via-[#f4e1c1] to-[#e8cfa8] shadow-[0_0_80px_20px_rgba(253,246,227,0.4)] z-10" aria-label="Moon">
          <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-[#e6dcc8] to-[#c4b8a0] opacity-60" />
        </div>

        {/* Fireflies / particles */}
        <Fireflies />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
          <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tight leading-[0.9] mb-8">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/60">Buy.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white/80 via-white/60 to-white/30">Edit.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white/60 via-white/40 to-white/20">Own.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide mb-12 max-w-2xl mx-auto">
            The premium marketplace for fully-built websites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#marketplace" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Explore Websites
              <ArrowDown size={18} />
            </a>
            <a href="#sell" className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/5 transition-colors duration-300 backdrop-blur-sm">
              Start Selling
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ArrowDown size={24} className="text-white/40" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-20 mx-4 md:mx-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {[
            { label: 'Websites Sold', value: '500+' },
            { label: 'Users', value: '10,000+' },
            { label: 'Earned by Sellers', value: '$2M+' },
            { label: 'Average Rating', value: '4.9★' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 pt-32 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-16 md:mb-24 tracking-tight">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {[
            { step: '01', title: 'Browse', desc: 'Discover fully-built websites across categories, tech stacks, and price points.' },
            { step: '02', title: 'Purchase', desc: 'Secure checkout with Stripe. Funds held in escrow until you confirm satisfaction.' },
            { step: '03', title: 'Edit / Own', desc: 'Launch your no-code visual editor. Customize everything. Publish instantly.' },
          ].map((item) => (
            <div key={item.step} className="group relative p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
              <span className="text-7xl md:text-8xl font-display font-bold text-white/[0.04] group-hover:text-white/[0.08] transition-colors absolute top-4 right-6 select-none">{item.step}</span>
              <h3 className="text-2xl md:text-3xl font-display font-semibold mb-4 relative z-10">{item.title}</h3>
              <p className="text-white/50 leading-relaxed relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Websites */}
      <section id="marketplace" className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight">Featured Websites</h2>
          <a href="#" className="text-white/40 hover:text-white transition-colors text-sm md:text-base flex items-center gap-2">View All <ArrowDown size={14} className="rotate-[-90deg]" /></a>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: 'Meridian SaaS', category: 'SaaS', price: '$299', rating: '4.9', color: 'from-amber-500 to-rose-500' },
            { title: 'Nocturne Portfolio', category: 'Portfolio', price: '$149', rating: '4.8', color: 'from-violet-500 to-fuchsia-500' },
            { title: 'Lumina E-commerce', category: 'E-commerce', price: '$399', rating: '5.0', color: 'from-emerald-500 to-cyan-500' },
          ].map((site) => (
            <a key={site.title} href="#" className="group block relative overflow-hidden rounded-3xl aspect-[4/5] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/20 transition-all duration-500 hover:-translate-y-1 shadow-xl shadow-black/50">
              <div className={`absolute inset-0 bg-gradient-to-br ${site.color} opacity-20 group-hover:opacity-30 transition-opacity duration-700`} />
              <img src={`https://picsum.photos/seed/${site.title}/600/750`} alt={site.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 mix-blend-overlay" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium border border-white/10">{site.category}</span>
              </div>
              <button className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-white/10 transition-colors" aria-label="Add to wishlist">
                <Heart size={16} className="text-white/70" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">{site.title}</h3>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <span className="font-medium text-white">{site.price}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Star size={12} fill="currentColor" className="text-amber-400" /> {site.rating}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Editor Showcase */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8">Visual Editor</h2>
            <p className="text-xl md:text-2xl text-white/50 leading-relaxed mb-10">
              After purchase, unlock an in-browser visual editor. Edit text inline, swap images, rearrange sections, and publish — all without touching a single line of code.
            </p>
            <ul className="space-y-4 text-white/60">
              {['Edit text inline (click-to-edit)', 'Swap images from library or upload', 'Rearrange layout sections', 'Change colors and fonts', 'Version history & rollback'].map((f) => (
                <li key={f} className="flex items-center gap-3"><Sparkles size={18} className="text-white/30 shrink-0" /> {f}</li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
            <img src="https://picsum.photos/seed/editor/1200/800" alt="Visual editor interface" className="w-full h-auto object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="text-sm font-medium text-white">Live Preview Updating...</div>
              <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="w-2/3 h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-12 md:mb-16">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: 'E-commerce', count: 120 },
            { name: 'Portfolio', count: 85 },
            { name: 'SaaS', count: 42 },
            { name: 'Blog', count: 67 },
            { name: 'Landing Page', count: 93 },
            { name: 'Dashboard', count: 34 },
            { name: 'Agency', count: 18 },
            { name: 'Restaurant', count: 21 },
          ].map((cat) => (
            <a key={cat.name} href="#" className="group p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-1">{cat.name}</h3>
              <span className="text-white/30 text-sm">{cat.count} listings</span>
            </a>
          ))}
        </div>
      </section>

      {/* Why Webmers */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-12 md:mb-16">Why Webmers</h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: 'No-Code Editor', desc: 'Modify your purchase instantly without code exposure. Full abstract component tree.' },
            { title: 'Secure Payments', desc: 'Stripe primary, Razorpay fallback. Escrow holds funds for 72-hour satisfaction window.' },
            { title: 'Code Ownership', desc: 'Unlock the full source code with a premium add-on. Download as zip or access private repo.' },
            { title: 'Custom Domains', desc: 'Connect your domain with auto-provisioned Let\'s Encrypt SSL certificates.' },
            { title: '24/7 Support', desc: 'Real-time messaging with sellers. Admin mediation for disputes.' },
            { title: 'Money-Back Guarantee', desc: 'Full refund within 48 hours if the site does not match its description.' },
          ].map((item) => (
            <div key={item.title} className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.06]">
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-3">{item.title}</h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Layout Options */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">Layout Options</h2>
          <p className="text-xl text-white/50">Each website offers multiple layout variants. Pick your preferred style during checkout or change it later in the editor.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {['Hero-Centered', 'Split-Screen', 'Video-Hero'].map((layout) => (
            <div key={layout} className="group relative overflow-hidden rounded-3xl aspect-[3/4] border border-white/10 shadow-2xl shadow-black/40">
              <img src={`https://picsum.photos/seed/layout-${layout}/600/800`} alt={`${layout} layout`} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-display font-bold">{layout}</h3>
                <p className="text-white/40 text-sm mt-2">Variant {layout.replace('-', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-12 md:mb-16">Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {[
            { quote: 'Webmers made it possible to launch a professional website in a weekend. The visual editor is incredible.', name: 'Sarah K.', role: 'Freelancer', site: 'Meridian SaaS' },
            { quote: 'I unlocked the code and customized everything. The delivery to my verified Gmail was instant and secure.', name: 'David R.', role: 'Developer', site: 'Lumina E-commerce' },
          ].map((t) => (
            <div key={t.name} className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} fill="currentColor" className="text-amber-400" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-display font-medium leading-snug mb-6 text-white/90">"{t.quote}"</blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400" />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-white/40">{t.role} · Purchased {t.site}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Code Unlock */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">Own the Code</h2>
        <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto">Every purchase includes full visual editing. Unlock the raw source with a premium add-on for complete ownership.</p>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 text-left">
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.10]">
            <h3 className="text-2xl font-display font-bold mb-4">Visual Edit</h3>
            <div className="text-5xl font-display font-bold mb-6">Included</div>
            <ul className="space-y-3 text-white/50 text-sm md:text-base">
              {['In-browser editor', 'Text, images, layout', 'Theme presets', 'Auto-save & rollback', 'Publish to live site'].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> {f}</li>
              ))}
            </ul>
          </div>
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.15] relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-400 text-black text-xs font-bold rounded-bl-xl">PREMIUM</div>
            <h3 className="text-2xl font-display font-bold mb-4">Full Code Access</h3>
            <div className="text-5xl font-display font-bold mb-6">$49 <span className="text-xl font-normal text-white/30">/ add-on</span></div>
            <ul className="space-y-3 text-white/50 text-sm md:text-base">
              {['Complete source code ZIP', 'Private GitHub repo access', 'Delivered to verified Gmail', 'Single-use time-limited download', 'Full customization freedom'].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-4xl mx-auto text-center">
        <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.10] shadow-2xl shadow-black/50">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Get Weekly Curated Sites</h2>
          <p className="text-white/50 mb-8">Discover the best new websites. No spam. Unsubscribe anytime.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className="flex-1 px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors" />
            <button type="submit" className="px-8 py-4 rounded-full bg-white text-black font-medium hover:scale-[1.02] transition-transform">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer — Daytime Sky */}
      <footer className="relative z-10 overflow-hidden bg-gradient-to-b from-[#87CEEB] via-[#b0e2ff] to-[#e8f6ff] text-black pt-32 pb-16 px-6 md:px-16">
        {/* Animated sun */}
        <div className="absolute top-8 right-12 md:right-24 w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-[#ffeb3b] to-[#ff9800] shadow-[0_0_80px_20px_rgba(255,235,59,0.5)]" aria-label="Sun" />
        
        {/* Grass blades (CSS) */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 flex items-end justify-around opacity-60">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1 md:w-2 bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t-full animate-sway origin-bottom" style={{ height: `${60 + Math.random() * 80}px`, animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h3 className="font-display text-3xl md:text-5xl font-bold mb-4">Webmers</h3>
              <p className="text-black/50 text-base md:text-lg max-w-md">The premium marketplace for fully-built websites. Buy. Edit. Own.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-black/50 text-sm">
                <li><a href="#" className="hover:text-black transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Visual Editor</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Code Unlock</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Custom Domains</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-black/50 text-sm">
                <li><a href="#" className="hover:text-black transition-colors">About</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Legal</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-black/30">
            <span>© 2026 Webmers. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stars() {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden" aria-hidden="true">
      {[...Array(60)].map((_, i) => {
        const top = Math.random() * 60 + '%';
        const left = Math.random() * 100 + '%';
        const delay = Math.random() * 3;
        const duration = 2 + Math.random() * 3;
        const size = 1 + Math.random() * 2;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top,
              left,
              width: size + 'px',
              height: size + 'px',
              animation: `twinkle ${duration}s ease-in-out infinite`,
              animationDelay: delay + 's',
              opacity: 0.2 + Math.random() * 0.8,
            }}
          />
        );
      })}
    </div>
  );
}

function Fireflies() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
      {[...Array(20)].map((_, i) => {
        const top = Math.random() * 80 + 10 + '%';
        const left = Math.random() * 90 + 5 + '%';
        const delay = Math.random() * 4;
        const duration = 4 + Math.random() * 4;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-amber-200"
            style={{
              top,
              left,
              width: 3 + Math.random() * 3 + 'px',
              height: 3 + Math.random() * 3 + 'px',
              boxShadow: '0 0 8px 2px rgba(253, 246, 227, 0.6)',
              animation: `float ${duration}s ease-in-out infinite`,
              animationDelay: delay + 's',
            }}
          />
        );
      })}
    </div>
  );
}
