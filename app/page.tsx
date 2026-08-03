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
import Newsletter from '@/components/Newsletter';
import SiteFooter from '@/components/SiteFooter';
import Eyebrow from '@/components/Eyebrow';
import Reveal from '@/components/Reveal';
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
  { n: '01', title: 'List your site', desc: 'Upload screenshots, stack and description. We review every submission for quality.' },
  { n: '02', title: 'Get reviewed', desc: 'We verify the build and publish it once it meets our measured standard.' },
  { n: '03', title: 'Get paid', desc: 'Buy through protected checkout; funds release after the satisfaction window.' },
];

export default async function Home() {
  const [featured, categories, stats, user] = await Promise.all([
    getFeaturedListings(3),
    getCategories(),
    getLandingStats(),
    getCurrentUser(),
  ]);

  let wishlistIds = new Set<string>();
  if (user) {
    const wishlist = await getWishlist(user.id);
    wishlistIds = new Set(wishlist.map((l) => l.id));
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-6 bg-[#f3efe8] text-wander-dark font-body selection:bg-wander-orange/20 selection:text-wander-dark overflow-x-hidden">
      <div className="max-w-[1600px] w-full flex flex-col gap-12 md:gap-16">
        {/* 1. Hero Container & Navbar */}
        <MeasuredHero />

        {/* 2. Stats Section */}
        <section className="relative z-20 -mt-6 md:-mt-8">
          <Reveal>
            <div className="mx-auto rounded-[28px] md:rounded-[36px] bg-white/80 border border-wander-dark/10 px-8 py-8 shadow-sm backdrop-blur-md md:px-12 md:py-10">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                {stats.map((s) => (
                  <div key={s.label} className="text-center md:text-left">
                    <div className="font-heading text-4xl font-bold tracking-tight text-wander-dark md:text-5xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] font-bold text-wander-dark/60">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* 3. How It Grows */}
        <section id="how" className="relative py-4">
          <div className="relative mx-auto">
            <Reveal>
              <div className="mb-10 flex max-w-3xl flex-col gap-3">
                <Eyebrow icon={<Sparkles size={13} />}>How it grows</Eyebrow>
                <h2 className="text-balance font-heading text-4xl font-medium leading-[1.05] tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                  From seed to launch in <span className="text-wander-orange">three smooth steps.</span>
                </h2>
                <p className="max-w-xl text-base leading-relaxed text-wander-text/80">
                  No bulky frames, no confusing setup — just a clean path from finding a site to making it yours.
                </p>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((item, i) => (
                <Reveal key={item.step} delay={i * 90}>
                  <div className="group relative h-full rounded-[24px] bg-white/80 border border-wander-dark/10 p-8 shadow-sm transition hover:border-wander-orange/40 hover:shadow-md">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="font-heading text-5xl font-bold text-wander-dark/15 transition group-hover:text-wander-orange/30">
                        {item.step}
                      </span>
                      <span className="h-10 w-10 rounded-full border border-wander-dark/15 bg-wander-blue/20" />
                    </div>
                    <h3 className="mb-3 font-heading text-2xl font-medium tracking-tight text-wander-dark">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-wander-text/80">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Featured Canopy / Marketplace */}
        <section id="marketplace" className="relative py-4">
          <div className="relative mx-auto">
            <Reveal>
              <div className="mb-10 flex items-end justify-between gap-6">
                <div>
                  <div className="mb-3">
                    <Eyebrow>Featured canopy</Eyebrow>
                  </div>
                  <h2 className="text-balance font-heading text-4xl font-medium tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                    Fresh websites, <span className="text-wander-orange">hand picked.</span>
                  </h2>
                </div>
                <Link
                  href="/marketplace"
                  className="hidden items-center gap-2 rounded-full border border-wander-dark/20 bg-white/80 px-6 py-3 text-xs font-bold uppercase tracking-wider text-wander-dark transition hover:bg-wander-dark hover:text-white md:inline-flex"
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

        {/* 5. Editor Showcase */}
        <section className="relative py-4">
          <div className="mx-auto rounded-[32px] bg-wander-blue/15 border border-wander-dark/10 p-8 md:p-12 lg:p-16">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <Reveal>
                <div>
                  <Eyebrow icon={<Wand2 size={13} />}>Visual editor</Eyebrow>
                  <h2 className="mt-4 text-balance font-heading text-4xl font-medium leading-[1.05] tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                    Tune every detail <span className="text-wander-orange">without touching code.</span>
                  </h2>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-wander-text/80">
                    After purchase, unlock an in-browser editor for text, imagery, layout and brand changes. Precise, fast, and completely effortless.
                  </p>
                  <ul className="mt-8 grid gap-3 text-sm font-medium text-wander-dark sm:grid-cols-2">
                    {editorFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-3 rounded-full border border-wander-dark/15 bg-white/80 px-4 py-3 shadow-xs">
                        <Sparkles size={14} className="shrink-0 text-wander-orange" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/editor"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-wander-dark px-8 py-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orange-500"
                  >
                    Try the editor <ArrowRight size={14} />
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="relative overflow-hidden rounded-[24px] border border-wander-dark/15 bg-white p-2 shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[18px]">
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
                  <div className="absolute bottom-6 left-6 rounded-full bg-wander-dark/90 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm backdrop-blur-md">
                    Live preview • Visual Editor
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 6. Browse by Habitat / Categories */}
        <section className="relative py-4">
          <div className="relative mx-auto">
            <Reveal>
              <div className="mb-10 flex flex-col gap-3">
                <Eyebrow>Browse by habitat</Eyebrow>
                <h2 className="text-balance font-heading text-4xl font-medium tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                  Find your niche <span className="text-wander-orange">naturally.</span>
                </h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.map((cat, i) => (
                <Reveal key={cat.name} delay={i * 70}>
                  <Link
                    href={`/marketplace?cat=${encodeURIComponent(cat.name)}`}
                    className="group block h-full rounded-[20px] bg-white/80 border border-wander-dark/10 p-6 shadow-sm transition hover:-translate-y-1 hover:border-wander-orange/40 hover:shadow-md"
                  >
                    <h3 className="mb-1 font-heading text-xl font-medium tracking-tight text-wander-dark group-hover:text-wander-orange transition-colors md:text-2xl">
                      {cat.name}
                    </h3>
                    <span className="text-xs font-medium text-wander-dark/60">{cat.count} listings</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Why Webmers */}
        <section className="relative py-4">
          <div className="relative mx-auto">
            <Reveal>
              <div className="mb-10 max-w-3xl">
                <Eyebrow icon={<ShieldCheck size={13} />}>Why Webmers</Eyebrow>
                <h2 className="mt-4 text-balance font-heading text-4xl font-medium leading-[1.05] tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                  Designed to feel <span className="text-wander-orange">measured, light and alive.</span>
                </h2>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={i * 70}>
                    <div className="h-full rounded-[24px] bg-white/80 border border-wander-dark/10 p-8 shadow-sm transition hover:border-wander-orange/40 hover:shadow-md">
                      <Icon className="mb-5 text-wander-orange" size={24} />
                      <h3 className="mb-2 font-heading text-xl font-medium text-wander-dark">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-wander-text/80">{item.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. Sell on Webmers */}
        <section className="relative py-4">
          <div className="relative mx-auto">
            <Reveal>
              <div className="mb-10 max-w-3xl">
                <Eyebrow icon={<Upload size={13} />}>Sell on Webmers</Eyebrow>
                <h2 className="mt-4 text-balance font-heading text-4xl font-medium leading-[1.05] tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                  Turn your builds <span className="text-wander-orange">into steady income.</span>
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-wander-text/80">
                  Already building websites? List them on Webmers and reach buyers who want to launch today.
                </p>
                <Link
                  href="/sell"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-wander-dark px-8 py-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orange-500"
                >
                  Start selling <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {sellSteps.map((item, i) => (
                <Reveal key={item.n} delay={i * 90}>
                  <div className="h-full rounded-[24px] bg-white/80 border border-wander-dark/10 p-8 shadow-sm">
                    <div className="mb-6 font-heading text-5xl font-bold text-wander-dark/20">{item.n}</div>
                    <h3 className="mb-3 font-heading text-2xl font-medium tracking-tight text-wander-dark">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-wander-text/80">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Layout Options */}
        <section className="relative py-4">
          <div className="relative mx-auto">
            <Reveal>
              <div className="mx-auto mb-10 max-w-3xl text-center">
                <div className="flex justify-center">
                  <Eyebrow>Layout options</Eyebrow>
                </div>
                <h2 className="mt-4 text-balance font-heading text-4xl font-medium leading-[1.05] tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                  Choose a shape <span className="text-wander-orange">that fits your story.</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-wander-text/80">
                  Each website offers layout variants you can pick during checkout or adjust later in the editor.
                </p>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {layoutVariants.map((layout, i) => (
                <Reveal key={layout} delay={i * 90}>
                  <div className="group relative aspect-[3/4] h-full overflow-hidden rounded-[28px] border border-wander-dark/15 bg-wander-blue/20 shadow-sm">
                    <Image
                      src="/layout-preview.jpg"
                      alt=""
                      fill
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover opacity-60 mix-blend-overlay transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wander-dark/90 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="font-heading text-2xl font-medium tracking-tight text-white">{layout}</h3>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/70">Variant {layout.replace('-', ' ')}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Testimonials */}
        <section id="stories" className="relative py-4">
          <div className="relative mx-auto">
            <Reveal>
              <div className="mb-10">
                <Eyebrow icon={<Star size={13} />}>Field notes</Eyebrow>
                <h2 className="mt-3 font-heading text-4xl font-medium tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                  Loved by <span className="text-wander-orange">fast launchers.</span>
                </h2>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 90}>
                  <div className="h-full rounded-[28px] bg-white/80 border border-wander-dark/10 p-8 shadow-sm md:p-10">
                    <div className="mb-5 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={15} fill="currentColor" className="text-wander-orange" />
                      ))}
                    </div>
                    <blockquote className="mb-6 text-balance font-heading text-xl font-normal leading-snug text-wander-dark md:text-2xl">
                      "{t.quote}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-wander-orange/20 border border-wander-orange/40 flex items-center justify-center font-bold text-wander-orange">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-wander-dark">{t.name}</div>
                        <div className="text-xs text-wander-dark/60">{t.role} · Purchased {t.site}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 11. Pricing / Code Unlock */}
        <section id="pricing" className="relative py-4 text-center">
          <div className="relative mx-auto max-w-5xl">
            <Reveal>
              <div className="flex flex-col items-center">
                <Eyebrow icon={<Code2 size={13} />}>Ownership</Eyebrow>
                <h2 className="mt-4 max-w-3xl text-balance font-heading text-4xl font-medium leading-[1.05] tracking-tight text-wander-dark md:text-5xl lg:text-6xl">
                  Own the code when <span className="text-wander-orange">your roots go deeper.</span>
                </h2>
                <p className="mx-auto mb-10 mt-4 max-w-2xl text-base text-wander-text/80">
                  Every purchase includes full visual editing. Unlock raw source as a premium add-on for complete ownership.
                </p>
              </div>
            </Reveal>
            <div className="mx-auto grid max-w-4xl gap-6 text-left md:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-[28px] bg-white/80 border border-wander-dark/10 p-8 shadow-sm">
                  <h3 className="mb-2 font-heading text-2xl font-medium text-wander-dark">Visual Edit</h3>
                  <div className="mb-6 font-heading text-4xl font-bold text-wander-dark">Included</div>
                  <ul className="space-y-3 text-sm text-wander-dark/80">
                    {visualPlanFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-wander-orange" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="relative h-full overflow-hidden rounded-[28px] bg-wander-dark p-8 text-white shadow-md">
                  <div className="absolute right-0 top-0 rounded-bl-2xl bg-wander-orange px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    Premium
                  </div>
                  <h3 className="mb-2 font-heading text-2xl font-medium text-white">Full Code Access</h3>
                  <div className="mb-6 font-heading text-4xl font-bold text-white">
                    $49 <span className="text-sm font-normal text-white/60">/ add-on</span>
                  </div>
                  <ul className="space-y-3 text-sm text-white/80">
                    {codePlanFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-wander-orange" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 12. Newsletter Section */}
        <section className="relative py-4">
          <Reveal>
            <div className="mx-auto rounded-[32px] bg-white/80 border border-wander-dark/10 p-8 text-center shadow-sm backdrop-blur-md md:p-14">
              <div className="flex justify-center">
                <Eyebrow>Weekly harvest</Eyebrow>
              </div>
              <h2 className="mt-4 font-heading text-3xl font-medium tracking-tight text-wander-dark md:text-5xl">
                Get curated sites in your inbox.
              </h2>
              <p className="mx-auto mb-8 mt-4 max-w-xl text-base text-wander-text/80">
                Discover the best new websites and digital gear. No spam. Unsubscribe anytime.
              </p>
              <Newsletter />
            </div>
          </Reveal>
        </section>

        {/* 13. Site Footer */}
        <SiteFooter />
      </div>
    </main>
  );
}
