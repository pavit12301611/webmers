import Link from 'next/link';
import { ArrowDown, ArrowRight, Code2, Globe2, Leaf, MessageCircle, RefreshCw, ShieldCheck, Sparkles, Star, Wand2 } from 'lucide-react';
import Header from '@/components/Header';
import NightSky from '@/components/NightSky';
import ListingCard from '@/components/ListingCard';
import Newsletter from '@/components/Newsletter';
import SiteFooter from '@/components/SiteFooter';
import Thumbnail, { ListingThumbnail } from '@/components/Thumbnail';
import { getCategories, getFeaturedListings, getLandingStats } from '@/lib/data';

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
  { icon: RefreshCw, title: 'Fair Guarantee', desc: 'Refund protection when a purchase does not match the listing description.' },
];

export default async function Home() {
  const [featured, categories, stats] = await Promise.all([
    getFeaturedListings(3),
    getCategories(),
    getLandingStats(),
  ]);

  return (
    <main className="nature-page overflow-hidden">
      <Header />

      {/* ------------------------------------------------ Nature Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 pb-20 md:px-16">
        <NightSky />
        <div className="relative z-20 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="reveal-soft max-w-4xl">
            <span className="section-eyebrow"><Leaf size={14} /> Nature-built digital launches</span>
            <h1 className="text-balance font-display text-5xl font-bold leading-[0.96] tracking-tight md:text-7xl lg:text-[6.8rem]">
              Websites that feel ready to bloom.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/62 md:text-xl">
              A calmer marketplace for fully-built websites. Buy a polished site, edit it visually, and own a launch-ready digital home without the heavy load.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/marketplace" className="btn-forest px-8 py-4">
                Explore the grove <ArrowDown size={18} />
              </Link>
              <Link href="/auth/signup" className="btn-bark px-8 py-4">
                Start selling <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="reveal-soft relative hidden lg:block" style={{ animationDelay: '120ms' }}>
            <div className="leaf-card relative overflow-hidden rounded-[2rem] p-4 shadow-2xl">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-emerald-50/10">
                {featured[0] ? <ListingThumbnail listing={featured[0]} showChrome /> : <Thumbnail title="Forest Portfolio" />}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-emerald-950/35 p-3 ring-1 ring-emerald-50/10">
                    <div className="font-display text-xl font-bold text-emerald-50">{stat.value}</div>
                    <div className="text-[11px] text-emerald-50/45">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-300/15 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl" />
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-50/35 md:flex">
          Scroll <ArrowDown size={16} className="animate-bounce" />
        </div>
      </section>

      {/* ------------------------------------------------ Stats Bar */}
      <section className="relative z-10 -mt-10 px-4 md:px-12">
        <div className="leaf-card mx-auto max-w-6xl rounded-[2rem] p-6 md:p-10">
          <div className="grid grid-cols-2 gap-5 text-center md:grid-cols-4 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-emerald-950/20 p-4">
                <div className="mb-1 font-display text-3xl font-bold text-emerald-50 md:text-5xl">{stat.value}</div>
                <div className="text-sm text-emerald-50/45 md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ How It Works */}
      <section id="how" className="nature-container relative z-10 pt-28 pb-16">
        <span className="section-eyebrow"><Sparkles size={14} /> How it grows</span>
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="text-balance font-display text-4xl font-bold tracking-tight md:text-6xl">From seed to launch in three smooth steps.</h2>
          <p className="max-w-md text-emerald-50/52">No bulky frames, no confusing setup — just a clean path from finding a site to making it yours.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="group leaf-card overflow-hidden rounded-[2rem] p-7 transition duration-500 hover:-translate-y-1 hover:border-emerald-200/25 md:p-9">
              <div className="mb-10 flex items-center justify-between">
                <span className="font-display text-6xl font-bold text-emerald-100/[0.07] transition-colors group-hover:text-emerald-100/[0.12]">{item.step}</span>
                <span className="h-11 w-11 rounded-full bg-lime-200/10 ring-1 ring-lime-100/15" />
              </div>
              <h3 className="mb-3 font-display text-2xl font-semibold md:text-3xl">{item.title}</h3>
              <p className="leading-relaxed text-emerald-50/52">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Featured Websites */}
      <section id="marketplace" className="nature-container relative z-10 pt-16 pb-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="section-eyebrow"><Leaf size={14} /> Featured canopy</span>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Fresh websites, hand picked.</h2>
          </div>
          <Link href="/marketplace" className="hidden items-center gap-2 rounded-full border border-emerald-50/10 px-5 py-3 text-sm text-emerald-50/55 transition hover:border-emerald-50/25 hover:text-emerald-50 md:inline-flex">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((site) => (
            <ListingCard key={site.id} listing={site} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Editor Showcase */}
      <section className="nature-container relative z-10 py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="section-eyebrow"><Wand2 size={14} /> Visual editor</span>
            <h2 className="text-balance font-display text-4xl font-bold tracking-tight md:text-6xl">Tune every detail without touching code.</h2>
            <p className="mt-6 text-lg leading-8 text-emerald-50/55 md:text-xl">
              After purchase, unlock an in-browser editor for text, imagery, layout and brand changes. Everything feels light, clear and immediate.
            </p>
            <ul className="mt-8 grid gap-3 text-emerald-50/62 sm:grid-cols-2">
              {['Inline text editing', 'Image swapping', 'Section rearranging', 'Colors and fonts', 'Version rollback', 'Instant publish'].map((f) => (
                <li key={f} className="flex items-center gap-3 rounded-2xl bg-emerald-950/25 px-4 py-3 ring-1 ring-emerald-50/8">
                  <Sparkles size={16} className="shrink-0 text-lime-200/70" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/editor" className="btn-bark mt-9 px-7 py-3.5">
              Try the editor <ArrowRight size={16} />
            </Link>
          </div>
          <div className="leaf-card relative overflow-hidden rounded-[2rem] p-3">
            <div className="aspect-[3/2] overflow-hidden rounded-[1.5rem] border border-emerald-50/10">
              {featured[0] && <ListingThumbnail listing={featured[0]} showChrome />}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Categories */}
      <section className="nature-container relative z-10 py-24">
        <span className="section-eyebrow"><Leaf size={14} /> Browse by habitat</span>
        <h2 className="mb-10 font-display text-4xl font-bold tracking-tight md:text-6xl">Find your niche naturally.</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/marketplace?cat=${encodeURIComponent(cat.name)}`}
              className="leaf-card group rounded-[1.7rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-lime-100/25 md:p-7"
            >
              <h3 className="mb-1 font-display text-xl font-semibold md:text-2xl">{cat.name}</h3>
              <span className="text-sm text-emerald-50/40">{cat.count} {cat.count === 1 ? 'listing' : 'listings'}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Why Webmers */}
      <section className="nature-container relative z-10 py-24">
        <div className="mb-10 max-w-3xl">
          <span className="section-eyebrow"><ShieldCheck size={14} /> Why Webmers</span>
          <h2 className="text-balance font-display text-4xl font-bold tracking-tight md:text-6xl">Designed to feel trustworthy, light and alive.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="leaf-card rounded-[1.8rem] p-7">
                <Icon className="mb-5 text-lime-200/75" size={24} />
                <h3 className="mb-3 font-display text-xl font-semibold md:text-2xl">{item.title}</h3>
                <p className="leading-relaxed text-emerald-50/52">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------ Layout Options */}
      <section className="nature-container relative z-10 py-24">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="section-eyebrow"><Sparkles size={14} /> Layout options</span>
          <h2 className="text-balance font-display text-4xl font-bold tracking-tight md:text-6xl">Choose a shape that fits your story.</h2>
          <p className="mt-5 text-lg text-emerald-50/52">Each website offers layout variants you can pick during checkout or adjust later in the editor.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {['Hero-Centered', 'Split-Screen', 'Video-Hero'].map((layout) => (
            <div key={layout} className="group leaf-card relative aspect-[3/4] overflow-hidden rounded-[2rem] p-3">
              <div className="absolute inset-3 overflow-hidden rounded-[1.5rem] transition-transform duration-700 group-hover:scale-[1.025]">
                <Thumbnail title={layout} palette={undefined} showChrome />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#07130e]/92 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <h3 className="font-display text-2xl font-bold md:text-3xl">{layout}</h3>
                <p className="mt-2 text-sm text-emerald-50/48">Variant {layout.replace('-', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Testimonials */}
      <section className="nature-container relative z-10 py-24">
        <span className="section-eyebrow"><Star size={14} /> Field notes</span>
        <h2 className="mb-10 font-display text-4xl font-bold tracking-tight md:text-6xl">Loved by fast launchers.</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { quote: 'Webmers made it possible to launch a professional website in a weekend. The visual editor is incredible.', name: 'Sarah K.', role: 'Freelancer', site: 'Meridian SaaS' },
            { quote: 'I unlocked the code and customized everything. Delivery was instant and secure.', name: 'David R.', role: 'Developer', site: 'Lumina E-commerce' },
          ].map((t) => (
            <div key={t.name} className="leaf-card rounded-[2rem] p-7 md:p-9">
              <div className="mb-5 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} fill="currentColor" className="text-[#f4d58d]" />
                ))}
              </div>
              <blockquote className="mb-7 font-display text-xl font-medium leading-snug text-emerald-50/90 md:text-2xl">“{t.quote}”</blockquote>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-lime-200 to-emerald-600 ring-4 ring-lime-100/10" />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-emerald-50/42">{t.role} · Purchased {t.site}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Pricing / Code Unlock */}
      <section id="pricing" className="nature-container relative z-10 py-24 text-center">
        <span className="section-eyebrow"><Code2 size={14} /> Ownership</span>
        <h2 className="mx-auto max-w-3xl text-balance font-display text-4xl font-bold tracking-tight md:text-6xl">Own the code when your roots go deeper.</h2>
        <p className="mx-auto mt-5 mb-10 max-w-2xl text-lg text-emerald-50/52 md:text-xl">Every purchase includes full visual editing. Unlock raw source as a premium add-on for complete ownership.</p>
        <div className="mx-auto grid max-w-5xl gap-6 text-left md:grid-cols-2">
          <div className="leaf-card rounded-[2rem] p-8 md:p-10">
            <h3 className="mb-4 font-display text-2xl font-bold">Visual Edit</h3>
            <div className="mb-6 font-display text-5xl font-bold">Included</div>
            <ul className="space-y-3 text-sm text-emerald-50/55 md:text-base">
              {['In-browser editor', 'Text, images, layout', 'Theme presets', 'Auto-save & rollback', 'Publish to live site'].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" /> {f}</li>
              ))}
            </ul>
          </div>
          <div className="leaf-card relative overflow-hidden rounded-[2rem] p-8 md:p-10">
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#f4d58d] px-3 py-1 text-xs font-bold text-[#07130e]">PREMIUM</div>
            <h3 className="mb-4 font-display text-2xl font-bold">Full Code Access</h3>
            <div className="mb-6 font-display text-5xl font-bold">$49 <span className="text-xl font-normal text-emerald-50/35">/ add-on</span></div>
            <ul className="space-y-3 text-sm text-emerald-50/55 md:text-base">
              {['Complete source code ZIP', 'Private GitHub repo access', 'Delivered to your inbox', 'Single-use time-limited download', 'Full customization freedom'].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4d58d]" /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Newsletter */}
      <section className="nature-container relative z-10 py-24 text-center">
        <div className="leaf-card mx-auto max-w-4xl overflow-hidden rounded-[2.2rem] p-9 md:p-14">
          <span className="section-eyebrow"><Leaf size={14} /> Weekly harvest</span>
          <h2 className="mb-5 font-display text-3xl font-bold md:text-5xl">Get curated sites in your inbox.</h2>
          <p className="mb-8 text-emerald-50/52">Discover the best new websites. No spam. Unsubscribe anytime.</p>
          <Newsletter />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
