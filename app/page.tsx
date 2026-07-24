import Link from 'next/link';
import { ArrowDown, ArrowRight, Sparkles, Star } from 'lucide-react';
import Header from '@/components/Header';
import NightSky from '@/components/NightSky';
import ListingCard from '@/components/ListingCard';
import Newsletter from '@/components/Newsletter';
import SiteFooter from '@/components/SiteFooter';
import Thumbnail, { ListingThumbnail } from '@/components/Thumbnail';
import { getCategories, getFeaturedListings, getLandingStats } from '@/lib/data';

export default async function Home() {
  const [featured, categories, stats] = await Promise.all([
    getFeaturedListings(3),
    getCategories(),
    getLandingStats(),
  ]);

  return (
    <main className="relative overflow-hidden">
      <Header />

      {/* ------------------------------------------------ Night Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] via-[#0a0a14] to-[#121224] z-0" />
        <NightSky />

        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto animate-fade-up">
          <h1 className="font-display text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tight leading-[0.9] mb-8">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/60">Buy.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white/80 via-white/60 to-white/30">Edit.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white/60 via-white/40 to-white/20">Own.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide mb-12 max-w-2xl mx-auto">
            The premium marketplace for fully-built websites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              Explore Websites <ArrowDown size={18} />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/5 transition-colors duration-300 backdrop-blur-sm"
            >
              Start Selling
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ArrowDown size={24} className="text-white/40" />
        </div>
      </section>

      {/* ------------------------------------------------ Stats Bar */}
      <section className="relative z-10 -mt-20 px-4 md:px-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ How It Works */}
      <section id="how" className="relative z-10 pt-32 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-16 md:mb-24 tracking-tight">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {[
            { step: '01', title: 'Browse', desc: 'Discover fully-built websites across categories, tech stacks, and price points.' },
            { step: '02', title: 'Purchase', desc: 'Secure checkout. Funds held in escrow for a 72-hour satisfaction window.' },
            { step: '03', title: 'Edit / Own', desc: 'Launch the no-code visual editor. Customize everything. Publish instantly.' },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
            >
              <span className="text-7xl md:text-8xl font-display font-bold text-white/[0.04] group-hover:text-white/[0.08] transition-colors absolute top-4 right-6 select-none">
                {item.step}
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-semibold mb-4 relative z-10">{item.title}</h3>
              <p className="text-white/50 leading-relaxed relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Featured Websites */}
      <section id="marketplace" className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight">Featured Websites</h2>
          <Link href="/marketplace" className="text-white/40 hover:text-white transition-colors text-sm md:text-base flex items-center gap-2">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featured.map((site) => (
            <ListingCard key={site.id} listing={site} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Editor Showcase */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8">Visual Editor</h2>
            <p className="text-xl md:text-2xl text-white/50 leading-relaxed mb-10">
              After purchase, unlock an in-browser visual editor. Edit text inline, swap images, rearrange sections, and publish — all without touching a single line of code.
            </p>
            <ul className="space-y-4 text-white/60">
              {['Edit text inline (click-to-edit)', 'Swap images from library or upload', 'Rearrange layout sections', 'Change colors and fonts', 'Version history & rollback'].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <Sparkles size={18} className="text-white/30 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/editor"
              className="mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/15 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Try the Editor <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 aspect-[3/2]">
            {featured[0] && <ListingThumbnail listing={featured[0]} showChrome />}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Categories */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-12 md:mb-16">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/marketplace?cat=${encodeURIComponent(cat.name)}`}
              className="group p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-1">{cat.name}</h3>
              <span className="text-white/30 text-sm">{cat.count} {cat.count === 1 ? 'listing' : 'listings'}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Why Webmers */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-12 md:mb-16">Why Webmers</h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: 'No-Code Editor', desc: 'Modify your purchase instantly without code exposure. Full abstract component tree.' },
            { title: 'Secure Payments', desc: 'Stripe-ready checkout with escrow. Funds held for a 72-hour satisfaction window.' },
            { title: 'Code Ownership', desc: 'Unlock the full source code with a premium add-on. Download as a ZIP.' },
            { title: 'Custom Domains', desc: 'Connect your domain with auto-provisioned SSL certificates.' },
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

      {/* ------------------------------------------------ Layout Options */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">Layout Options</h2>
          <p className="text-xl text-white/50">
            Each website offers multiple layout variants. Pick your preferred style during checkout or change it later in the editor.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {['Hero-Centered', 'Split-Screen', 'Video-Hero'].map((layout) => (
            <div key={layout} className="group relative overflow-hidden rounded-3xl aspect-[3/4] border border-white/10 shadow-2xl shadow-black/40">
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <Thumbnail title={layout} palette={undefined} showChrome />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-display font-bold">{layout}</h3>
                <p className="text-white/50 text-sm mt-2">Variant {layout.replace('-', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Testimonials */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-12 md:mb-16">Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {[
            { quote: 'Webmers made it possible to launch a professional website in a weekend. The visual editor is incredible.', name: 'Sarah K.', role: 'Freelancer', site: 'Meridian SaaS' },
            { quote: 'I unlocked the code and customized everything. Delivery was instant and secure.', name: 'David R.', role: 'Developer', site: 'Lumina E-commerce' },
          ].map((t) => (
            <div key={t.name} className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} fill="currentColor" className="text-amber-400" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-display font-medium leading-snug mb-6 text-white/90">
                “{t.quote}”
              </blockquote>
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

      {/* ------------------------------------------------ Pricing / Code Unlock */}
      <section id="pricing" className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">Own the Code</h2>
        <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto">
          Every purchase includes full visual editing. Unlock the raw source with a premium add-on for complete ownership.
        </p>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 text-left">
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.10]">
            <h3 className="text-2xl font-display font-bold mb-4">Visual Edit</h3>
            <div className="text-5xl font-display font-bold mb-6">Included</div>
            <ul className="space-y-3 text-white/50 text-sm md:text-base">
              {['In-browser editor', 'Text, images, layout', 'Theme presets', 'Auto-save & rollback', 'Publish to live site'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.15] relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-400 text-black text-xs font-bold rounded-bl-xl">PREMIUM</div>
            <h3 className="text-2xl font-display font-bold mb-4">Full Code Access</h3>
            <div className="text-5xl font-display font-bold mb-6">$49 <span className="text-xl font-normal text-white/30">/ add-on</span></div>
            <ul className="space-y-3 text-white/50 text-sm md:text-base">
              {['Complete source code ZIP', 'Private GitHub repo access', 'Delivered to your inbox', 'Single-use time-limited download', 'Full customization freedom'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Newsletter */}
      <section className="relative z-10 pt-16 pb-32 px-6 md:px-16 max-w-4xl mx-auto text-center">
        <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.10] shadow-2xl shadow-black/50">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Get Weekly Curated Sites</h2>
          <p className="text-white/50 mb-8">Discover the best new websites. No spam. Unsubscribe anytime.</p>
          <Newsletter />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
