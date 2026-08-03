import Link from 'next/link';
import { ArrowRight, Code2, Globe2, MessageCircle, ShieldCheck, Sparkles, Star, Wand2 } from 'lucide-react';
import MeasuredHero from '@/components/MeasuredHero';
import ListingCard from '@/components/ListingCard';
import GridPattern from '@/components/GridPattern';
import Newsletter from '@/components/Newsletter';
import SiteFooter from '@/components/SiteFooter';
import { getCategories, getFeaturedListings, getLandingStats, getWishlist } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';

const steps = [
  { step: '01', title: 'Explore', desc: 'Walk through curated, launch-ready websites organized by niche, stack and growth stage.' },
  { step: '02', title: 'Secure', desc: 'Buy with confidence through protected checkout and a clear satisfaction window.' },
  { step: '03', title: 'Cultivate', desc: 'Open the visual editor, tune the brand, connect a domain and let your site grow.' },
];

const benefits = [
  { icon: Wand2, title: 'No-Code Editor', desc: 'Change copy, images, colors and sections in a calm visual workspace.' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Stripe-ready checkout with escrow-style protection and buyer confidence.' },
  { icon: Code2, title: 'Code Ownership', desc: 'Unlock the complete source when you need full customization freedom.' },
  { icon: Globe2, title: 'Custom Domains', desc: 'Launch on your own domain with SSL-ready publishing flows.' },
  { icon: MessageCircle, title: 'Human Support', desc: 'Talk with sellers and get admin mediation if anything needs attention.' },
  { icon: ShieldCheck, title: 'Fair Guarantee', desc: 'Refund protection when a purchase does not match the listing description.' },
];

// Ensure all data functions are actually used and correctly awaited
export default async function Home() {
  const [featured, categories, stats, user] = await Promise.all([
    getFeaturedListings(3),
    getCategories(),
    getLandingStats(),
    getCurrentUser(),
  ]);

  // Batch wishlist fetch once instead of per-card (was N+1, now 1)
  let wishlistIds = new Set<string>();
  if (user) {
    const wishlist = await getWishlist(user.id);
    wishlistIds = new Set(wishlist.map((l) => l.id));
  }

  return (
    <main className="overflow-hidden bg-white">
      <MeasuredHero />

      {/* Stats - overlapping */}
      <section className="relative z-20 -mt-16 px-4 md:px-10">
        <div className="mx-auto max-w-7xl rounded-[1.6rem] border border-white/[0.08] bg-[#0a0a0a]/80 px-6 py-6 backdrop-blur-2xl md:px-10 md:py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <div className="text-3xl tracking-tight text-white md:text-5xl" style={{ fontFamily: 'var(--font-instrument)' }}>
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative bg-[#0a0a0a] px-6 pb-24 pt-28 md:px-10">
        <GridPattern id="g1" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 flex max-w-3xl flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/50">
              <Sparkles size={12} /> How it grows
            </span>
            <h2 className="text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
              From seed to launch in three smooth steps.
            </h2>
            <p className="max-w-xl text-[15px] leading-7 text-white/45">
              No bulky frames, no confusing setup — just a clean path from finding a site to making it yours. Measured at every turn.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="group relative rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-7 backdrop-blur-xl transition hover:bg-white/[0.04] md:p-8">
                <div className="mb-10 flex items-center justify-between">
                  <span className="text-5xl text-white/[0.08] transition group-hover:text-white/[0.12]" style={{ fontFamily: 'var(--font-instrument)' }}>
                    {item.step}
                  </span>
                  <span className="h-10 w-10 rounded-full bg-white/[0.04] ring-1 ring-white/10" />
                </div>
                <h3 className="mb-3 text-xl font-medium tracking-tight text-white md:text-2xl">{item.title}</h3>
                <p className="text-[14px] leading-6 text-white/45">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section id="marketplace" className="relative bg-[#0a0a0a] px-6 py-24 md:px-10" style={{ contentVisibility: 'auto' }}>
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
                Featured canopy
              </span>
              <h2 className="text-4xl tracking-tight text-white md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
                Fresh websites, hand picked.
              </h2>
            </div>
            <Link href="/marketplace" className="hidden items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white md:inline-flex">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((site) => (
              <ListingCard key={site.id} listing={site} initialWishlisted={wishlistIds.has(site.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Editor showcase */}
      <section className="relative bg-[#0a0a0a] px-6 py-24 md:px-10" style={{ contentVisibility: 'auto' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/50">
              <Wand2 size={12} /> Visual editor
            </span>
            <h2 className="text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
              Tune every detail without touching code.
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-8 text-white/50">
              After purchase, unlock an in-browser editor for text, imagery, layout and brand changes. Everything feels dark, precise and immediate — like the spotlight reveal above.
            </p>
            <ul className="mt-8 grid gap-3 text-sm text-white/50 sm:grid-cols-2">
              {['Inline text editing', 'Image swapping', 'Section rearranging', 'Colors and fonts', 'Version rollback', 'Instant publish'].map((f) => (
                <li key={f} className="flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <Sparkles size={14} className="shrink-0 text-white/30" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/editor" className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90">
              Try the editor <ArrowRight size={14} />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#121212] p-2">
            <div className="aspect-[4/3] overflow-hidden rounded-[1.2rem]">
              <img
                src="/editor-preview.jpg"
                alt="Editor preview"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 rounded-full liquid-glass px-4 py-2 text-[11px] uppercase tracking-widest text-white/60">
              Live preview • Measured
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative bg-[#f8f8f6] px-6 py-24 text-black md:px-10" style={{ contentVisibility: 'auto' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-black/40">
              Browse by habitat
            </span>
            <h2 className="text-4xl tracking-tight md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
              Find your niche naturally.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/marketplace?cat=${encodeURIComponent(cat.name)}`}
                className="group rounded-[1.4rem] border border-black/[0.06] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_60px_rgba(0,0,0,0.08)]"
              >
                <h3 className="mb-1 text-xl tracking-tight md:text-2xl" style={{ fontFamily: 'var(--font-instrument)' }}>
                  {cat.name}
                </h3>
                <span className="text-[13px] text-black/40">{cat.count} listings</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Webmers */}
      <section className="relative bg-[#0a0a0a] px-6 py-24 md:px-10" style={{ contentVisibility: 'auto' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
              <ShieldCheck size={12} /> Why Webmers
            </span>
            <h2 className="text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
              Designed to feel measured, light and alive.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[1.5rem] border border-white/[0.07] bg-white/[0.02] p-7 backdrop-blur-xl">
                  <Icon className="mb-5 text-white/40" size={22} />
                  <h3 className="mb-2 text-[18px] font-medium text-white">{item.title}</h3>
                  <p className="text-[14px] leading-6 text-white/45">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Layout options */}
      <section className="relative bg-[#0a0a0a] px-6 py-24 md:px-10" style={{ contentVisibility: 'auto' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
              Layout options
            </span>
            <h2 className="mt-4 text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
              Choose a shape that fits your story.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/40">Each website offers layout variants you can pick during checkout or adjust later in the editor.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {['Hero-Centered', 'Split-Screen', 'Video-Hero'].map((layout) => (
              <div key={layout} className="group relative aspect-[3/4] overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#121212]">
                <img
                  src="/layout-preview.jpg"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <h3 className="text-2xl tracking-tight text-white" style={{ fontFamily: 'var(--font-instrument)' }}>
                    {layout}
                  </h3>
                  <p className="mt-2 text-[12px] uppercase tracking-widest text-white/40">Variant {layout.replace('-', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="relative bg-[#f8f8f6] px-6 py-24 md:px-10" style={{ contentVisibility: 'auto' }}>
        <div className="mx-auto max-w-7xl">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-black/40">
            <Star size={12} /> Field notes
          </span>
          <h2 className="mb-10 text-4xl tracking-tight md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
            Loved by fast launchers.
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { quote: 'Webmers made it possible to launch a professional website in a weekend. The visual editor is incredible.', name: 'Sarah K.', role: 'Freelancer', site: 'Meridian SaaS' },
              { quote: 'I unlocked the code and customized everything. Delivery was instant and secure.', name: 'David R.', role: 'Developer', site: 'Lumina E-commerce' },
            ].map((t) => (
              <div key={t.name} className="rounded-[1.8rem] border border-black/[0.06] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)] md:p-10">
                <div className="mb-5 flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} fill="currentColor" className="text-black" />
                  ))}
                </div>
                <blockquote className="mb-7 text-balance text-xl font-[400] leading-snug md:text-2xl" style={{ fontFamily: 'var(--font-instrument)' }}>
                  “{t.quote}”
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-black" />
                  <div>
                    <div className="text-[14px] font-medium">{t.name}</div>
                    <div className="text-[12px] text-black/40">{t.role} · Purchased {t.site}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative bg-[#0a0a0a] px-6 py-24 text-center md:px-10" style={{ contentVisibility: 'auto' }}>
        <GridPattern id="g2" />
        <div className="relative mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
            <Code2 size={12} /> Ownership
          </span>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
            Own the code when your roots go deeper.
          </h2>
          <p className="mx-auto mb-10 mt-5 max-w-2xl text-white/40">Every purchase includes full visual editing. Unlock raw source as a premium add-on for complete ownership.</p>
          <div className="mx-auto grid max-w-4xl gap-5 text-left md:grid-cols-2">
            <div className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl">
              <h3 className="mb-2 text-[18px] font-medium text-white">Visual Edit</h3>
              <div className="mb-6 text-4xl text-white" style={{ fontFamily: 'var(--font-instrument)' }}>Included</div>
              <ul className="space-y-3 text-[13px] text-white/50">
                {['In-browser editor', 'Text, images, layout', 'Theme presets', 'Auto-save & rollback', 'Publish to live site'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-white/40" /> {f}</li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-white p-8 text-black">
              <div className="absolute right-0 top-0 rounded-bl-xl bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Premium</div>
              <h3 className="mb-2 text-[18px] font-medium">Full Code Access</h3>
              <div className="mb-6 text-4xl" style={{ fontFamily: 'var(--font-instrument)' }}>$49 <span className="text-[14px] font-sans text-black/40">/ add-on</span></div>
              <ul className="space-y-3 text-[13px] text-black/60">
                {['Complete source code ZIP', 'Private GitHub repo access', 'Delivered to your inbox', 'Single-use time-limited download', 'Full customization freedom'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black" /> {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative bg-[#0a0a0a] px-6 pb-24 md:px-10" style={{ contentVisibility: 'auto' }}>
        <div className="mx-auto max-w-4xl rounded-[1.8rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 text-center backdrop-blur-xl md:p-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
            Weekly harvest
          </span>
          <h2 className="mt-4 text-3xl tracking-tight text-white md:text-5xl" style={{ fontFamily: 'var(--font-instrument)' }}>
            Get curated sites in your inbox.
          </h2>
          <p className="mx-auto mb-8 mt-4 max-w-xl text-white/40">Discover the best new websites. No spam. Unsubscribe anytime. Measured curation only.</p>
          <Newsletter />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
