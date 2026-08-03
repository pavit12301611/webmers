import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Code2,
  Globe2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  Wand2,
} from 'lucide-react';
import MeasuredHero from '@/components/MeasuredHero';
import ListingCard from '@/components/ListingCard';
import GridPattern from '@/components/GridPattern';
import Newsletter from '@/components/Newsletter';
import SiteFooter from '@/components/SiteFooter';
import Eyebrow from '@/components/Eyebrow';
import Reveal from '@/components/Reveal';
import { getCategories, getFeaturedListings, getLandingStats, getWishlist } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';

const steps = [
  { step: '01', title: 'Explore', desc: 'Walk through curated, launch-ready websites organized by niche, stack and growth stage.', gradient: 'card-glow-purple' },
  { step: '02', title: 'Secure', desc: 'Buy with confidence through protected checkout and a clear satisfaction window.', gradient: 'card-glow-cyan' },
  { step: '03', title: 'Cultivate', desc: 'Open the visual editor, tune the brand, connect a domain and let your site grow.', gradient: 'card-glow-emerald' },
];

const benefits = [
  { icon: Wand2, title: 'No-Code Editor', desc: 'Change copy, images, colors and sections in a calm visual workspace.', glow: 'card-glow-purple' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Stripe-ready checkout with escrow-style protection and buyer confidence.', glow: 'card-glow-cyan' },
  { icon: Code2, title: 'Code Ownership', desc: 'Unlock the complete source when you need full customization freedom.', glow: 'card-glow-pink' },
  { icon: Globe2, title: 'Custom Domains', desc: 'Launch on your own domain with SSL-ready publishing flows.', glow: 'card-glow-emerald' },
  { icon: MessageCircle, title: 'Human Support', desc: 'Talk with sellers and get admin mediation if anything needs attention.', glow: 'card-glow-orange' },
  { icon: ShieldCheck, title: 'Fair Guarantee', desc: 'Refund protection when a purchase does not match the listing description.', glow: 'card-glow-purple' },
];

const editorFeatures = [
  'Inline text editing',
  'Image swapping',
  'Section rearranging',
  'Colors and fonts',
  'Version rollback',
  'Instant publish',
];

const layoutVariants = ['Hero-Centered', 'Split-Screen', 'Video-Hero'];

const testimonials = [
  { quote: 'Webmers made it possible to launch a professional website in a weekend. The visual editor is incredible.', name: 'Sarah K.', role: 'Freelancer', site: 'Meridian SaaS' },
  { quote: 'I unlocked the code and customized everything. Delivery was instant and secure.', name: 'David R.', role: 'Developer', site: 'Lumina E-commerce' },
];

const visualPlanFeatures = ['In-browser editor', 'Text, images, layout', 'Theme presets', 'Auto-save & rollback', 'Publish to live site'];
const codePlanFeatures = ['Complete source code ZIP', 'Private GitHub repo access', 'Delivered to your inbox', 'Single-use time-limited download', 'Full customization freedom'];

const sellSteps = [
  { n: '01', title: 'List your site', desc: 'Upload screenshots, stack and description. We review every submission for quality.', glow: 'card-glow-purple' },
  { n: '02', title: 'Get reviewed', desc: 'We verify the build and publish it once it meets our measured standard.', glow: 'card-glow-pink' },
  { n: '03', title: 'Get paid', desc: 'Buy through protected checkout; funds release after the satisfaction window.', glow: 'card-glow-emerald' },
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
    <main className="overflow-hidden" style={{ background: 'hsl(240, 15%, 6%)' }}>
      <MeasuredHero />

      {/* Stats - overlapping */}
      <section className="relative z-20 -mt-20 px-4 md:px-10">
        <Reveal>
          <div className="mx-auto max-w-7xl rounded-[1.6rem] border border-purple-500/15 bg-white/[0.04] px-6 py-6 backdrop-blur-2xl md:px-10 md:py-8 shadow-[0_0_60px_rgba(139,92,246,0.06)]">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center md:text-left">
                  <div className="font-instrument text-3xl tracking-tight text-foreground md:text-5xl">{s.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section id="how" className="section-gradient-aurora relative px-6 pb-24 pt-28 md:px-10" style={{ background: 'hsl(240, 15%, 6%)' }}>
        <GridPattern id="g1" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 flex max-w-3xl flex-col gap-4">
              <Eyebrow icon={<Sparkles size={12} />}>How it grows</Eyebrow>
              <h2 className="text-balance font-instrument text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
                From seed to launch in <span className="text-gradient-aurora">three smooth steps.</span>
              </h2>
              <p className="max-w-xl text-[15px] leading-7 text-white/45">
                No bulky frames, no confusing setup — just a clean path from finding a site to making it yours. Measured at every turn.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((item, i) => (
              <Reveal key={item.step} delay={i * 90}>
                <div className={`group relative h-full rounded-[1.6rem] p-7 backdrop-blur-xl transition md:p-8 ${item.gradient}`}>
                  <div className="mb-10 flex items-center justify-between">
                    <span className="font-instrument text-5xl text-white/[0.08] transition group-hover:text-white/[0.15]">{item.step}</span>
                    <span className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-purple-500/20" />
                  </div>
                  <h3 className="mb-3 text-xl font-medium tracking-tight text-foreground md:text-2xl">{item.title}</h3>
                  <p className="text-[14px] leading-6 text-white/45">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section id="marketplace" className="section-gradient-sunset relative px-6 py-24 md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <div className="mb-3">
                  <Eyebrow>Featured canopy</Eyebrow>
                </div>
                <h2 className="text-balance font-instrument text-4xl tracking-tight text-foreground md:text-6xl">
                  Fresh websites, <span className="text-gradient-sunset">hand picked.</span>
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="hidden items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:border-purple-500/30 hover:text-foreground md:inline-flex"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((site, i) => (
              <Reveal key={site.id} delay={i * 90}>
                <ListingCard listing={site} initialWishlisted={wishlistIds.has(site.id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Editor showcase */}
      <section className="section-gradient-ocean relative px-6 py-24 md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div>
              <Eyebrow icon={<Wand2 size={12} />}>Visual editor</Eyebrow>
              <h2 className="mt-4 text-balance font-instrument text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
                Tune every detail <span className="text-gradient-ocean">without touching code.</span>
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-8 text-white/50">
                After purchase, unlock an in-browser editor for text, imagery, layout and brand changes. Everything feels dark, precise and immediate — like the spotlight reveal above.
              </p>
              <ul className="mt-8 grid gap-3 text-sm text-white/50 sm:grid-cols-2">
                {editorFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <Sparkles size={14} className="shrink-0 text-purple-400/60" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/editor"
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Try the editor <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative overflow-hidden rounded-[1.8rem] border border-cyan-500/15 bg-[#0c0c14] p-2 shadow-[0_0_60px_rgba(6,182,212,0.08)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem]">
                <Image
                  src="/editor-preview.jpg"
                  alt="Editor preview"
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 rounded-full liquid-glass px-4 py-2 text-[11px] uppercase tracking-widest text-white/60">
                Live preview • Measured
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories */}
      <section className="section-gradient-forest relative px-6 py-24 md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10 flex flex-col gap-3">
              <Eyebrow>Browse by habitat</Eyebrow>
              <h2 className="text-balance font-instrument text-4xl tracking-tight text-foreground md:text-6xl">
                Find your niche <span className="text-gradient-emerald">naturally.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((cat, i) => {
              const gradients = ['card-glow-purple', 'card-glow-pink', 'card-glow-cyan', 'card-glow-emerald', 'card-glow-orange', 'card-glow-purple', 'card-glow-cyan', 'card-glow-pink'];
              return (
                <Reveal key={cat.name} delay={i * 70}>
                  <Link
                    href={`/marketplace?cat=${encodeURIComponent(cat.name)}`}
                    className={`group block h-full rounded-[1.4rem] p-6 backdrop-blur-xl transition hover:-translate-y-0.5 ${gradients[i % gradients.length]}`}
                  >
                    <h3 className="mb-1 font-instrument text-xl tracking-tight text-foreground md:text-2xl">{cat.name}</h3>
                    <span className="text-[13px] text-muted-foreground">{cat.count} listings</span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Webmers */}
      <section className="section-gradient-aurora relative px-6 py-24 md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 max-w-3xl">
              <Eyebrow icon={<ShieldCheck size={12} />}>Why Webmers</Eyebrow>
              <h2 className="mt-4 text-balance font-instrument text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
                Designed to feel <span className="text-gradient-aurora">measured, light and alive.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 70}>
                  <div className={`h-full rounded-[1.5rem] p-7 backdrop-blur-xl transition ${item.glow}`}>
                    <Icon className="mb-5 text-purple-400/60" size={22} />
                    <h3 className="mb-2 text-[18px] font-medium text-foreground">{item.title}</h3>
                    <p className="text-[14px] leading-6 text-white/45">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sell on Webmers */}
      <section className="section-gradient-sunset relative px-6 py-24 md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 max-w-3xl">
              <Eyebrow icon={<Upload size={12} />}>Sell on Webmers</Eyebrow>
              <h2 className="mt-4 text-balance font-instrument text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
                Turn your builds <span className="text-gradient-sunset">into steady income.</span>
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/45">
                Already building websites? List them on Webmers and reach buyers who want to launch today. Reviewed, protected, and paid — measured end to end.
              </p>
              <Link
                href="/sell"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 shadow-[0_0_20px_rgba(251,146,60,0.3)]"
              >
                Start selling <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {sellSteps.map((item, i) => (
              <Reveal key={item.n} delay={i * 90}>
                <div className={`h-full rounded-[1.5rem] p-7 backdrop-blur-xl ${item.glow}`}>
                  <div className="mb-8 font-instrument text-5xl text-white/[0.08]">{item.n}</div>
                  <h3 className="mb-3 text-xl font-medium tracking-tight text-foreground md:text-2xl">{item.title}</h3>
                  <p className="text-[14px] leading-6 text-white/45">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Layout options */}
      <section className="section-gradient-ocean relative px-6 py-24 md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <div className="flex justify-center">
                <Eyebrow>Layout options</Eyebrow>
              </div>
              <h2 className="mt-4 text-balance font-instrument text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
                Choose a shape <span className="text-gradient-ocean">that fits your story.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/40">
                Each website offers layout variants you can pick during checkout or adjust later in the editor.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {layoutVariants.map((layout, i) => {
              const overlays = [
                'from-purple-900/60 via-purple-900/20 to-transparent',
                'from-cyan-900/60 via-cyan-900/20 to-transparent',
                'from-emerald-900/60 via-emerald-900/20 to-transparent',
              ];
              const borders = ['border-purple-500/20', 'border-cyan-500/20', 'border-emerald-500/20'];
              return (
                <Reveal key={layout} delay={i * 90}>
                  <div className={`group relative aspect-[3/4] h-full overflow-hidden rounded-[1.8rem] border bg-[#0c0c14] ${borders[i]}`}>
                    <Image
                      src="/layout-preview.jpg"
                      alt=""
                      fill
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${overlays[i]}`} />
                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <h3 className="font-instrument text-2xl tracking-tight text-foreground">{layout}</h3>
                      <p className="mt-2 text-[12px] uppercase tracking-widest text-white/40">Variant {layout.replace('-', ' ')}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="section-gradient-aurora relative px-6 py-24 md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10">
              <Eyebrow icon={<Star size={12} />}>Field notes</Eyebrow>
              <h2 className="mt-3 font-instrument text-4xl tracking-tight text-foreground md:text-6xl">
                Loved by <span className="text-gradient-aurora">fast launchers.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <div className={`h-full rounded-[1.8rem] p-8 backdrop-blur-xl md:p-10 ${i === 0 ? 'card-glow-purple' : 'card-glow-pink'}`}>
                  <div className="mb-5 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill="currentColor" className="text-amber-400/80" />
                    ))}
                  </div>
                  <blockquote className="mb-7 text-balance font-instrument text-xl font-[400] leading-snug md:text-2xl text-foreground">
                    "{t.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ring-1 ring-white/15 ${i === 0 ? 'bg-gradient-to-br from-purple-400/40 to-pink-400/40' : 'bg-gradient-to-br from-cyan-400/40 to-emerald-400/40'}`} />
                    <div>
                      <div className="text-[14px] font-medium text-foreground">{t.name}</div>
                      <div className="text-[12px] text-white/40">{t.role} · Purchased {t.site}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-gradient-sunset relative px-6 py-24 text-center md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <GridPattern id="g2" />
        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <div className="flex flex-col items-center">
              <Eyebrow icon={<Code2 size={12} />}>Ownership</Eyebrow>
              <h2 className="mt-4 max-w-3xl text-balance font-instrument text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
                Own the code when <span className="text-gradient-sunset">your roots go deeper.</span>
              </h2>
              <p className="mx-auto mb-10 mt-5 max-w-2xl text-white/40">
                Every purchase includes full visual editing. Unlock raw source as a premium add-on for complete ownership.
              </p>
            </div>
          </Reveal>
          <div className="mx-auto grid max-w-4xl gap-5 text-left md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl card-glow-cyan">
                <h3 className="mb-2 text-[18px] font-medium text-foreground">Visual Edit</h3>
                <div className="mb-6 font-instrument text-4xl text-foreground">Included</div>
                <ul className="space-y-3 text-[13px] text-white/50">
                  {visualPlanFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="relative h-full overflow-hidden rounded-[1.6rem] border border-purple-500/30 bg-white p-8 text-black shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Premium
                </div>
                <h3 className="mb-2 text-[18px] font-medium">Full Code Access</h3>
                <div className="mb-6 font-instrument text-4xl">
                  $49 <span className="text-[14px] font-sans text-black/40">/ add-on</span>
                </div>
                <ul className="space-y-3 text-[13px] text-black/60">
                  {codePlanFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-600" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-gradient-ocean relative px-6 pb-24 md:px-10" style={{ background: 'hsl(240, 15%, 6%)', contentVisibility: 'auto' }}>
        <Reveal>
          <div className="mx-auto max-w-4xl rounded-[1.8rem] border border-purple-500/15 p-8 text-center backdrop-blur-xl md:p-14 card-glow-purple">
            <div className="flex justify-center">
              <Eyebrow>Weekly harvest</Eyebrow>
            </div>
            <h2 className="mt-4 font-instrument text-3xl tracking-tight text-foreground md:text-5xl">Get curated sites in your inbox.</h2>
            <p className="mx-auto mb-8 mt-4 max-w-xl text-white/40">
              Discover the best new websites. No spam. Unsubscribe anytime. Measured curation only.
            </p>
            <Newsletter />
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
