import Link from 'next/link';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ListingCard from '@/components/ListingCard';
import { getCategories, getListings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse fully-built websites ready to buy, edit and own.',
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string };
}) {
  const q = searchParams.q?.trim() ?? '';
  const cat = searchParams.cat ?? 'All';

  const [listings, categories] = await Promise.all([
    getListings({ category: cat, search: q }),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0a0a]">
      <Header />

      {/* Page head with grid */}
      <section className="relative px-6 pb-12 pt-36 md:px-10">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%"><defs><pattern id="mp-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" /></pattern></defs><rect width="100%" height="100%" fill="url(#mp-grid)" /></svg>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
            Marketplace grove
          </span>
          <h1
            className="mb-4 max-w-3xl text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Browse launch-ready websites.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-white/45">
            Fully-built websites, ready to launch. Filter by category or search for a stack with a measured, precise experience.
          </p>

          {/* Search - liquid glass */}
          <form action="/marketplace" method="get" className="mt-8 flex max-w-3xl flex-col gap-3 rounded-full border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search by name, category or tech…"
                className="w-full rounded-full bg-transparent py-3.5 pl-12 pr-4 text-white placeholder-white/25 outline-none"
              />
            </div>
            {cat !== 'All' && <input type="hidden" name="cat" value={cat} />}
            <button type="submit" className="rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition hover:bg-white/90">
              Search
            </button>
          </form>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <CategoryPill label="All" active={cat === 'All'} href="/marketplace" />
            {categories.map((c) => (
              <CategoryPill
                key={c.name}
                label={`${c.name} (${c.count})`}
                active={cat === c.name}
                href={`/marketplace?cat=${encodeURIComponent(c.name)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="relative mx-auto max-w-7xl px-6 pb-32 md:px-10">
        <div className="mb-6 text-[11px] uppercase tracking-[0.18em] text-white/30">
          {listings.length} {listings.length === 1 ? 'result' : 'results'}
          {cat !== 'All' && <> in <span className="text-white/60">{cat}</span></>}
          {q && <> for <span className="text-white/60">“{q}”</span></>}
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] py-24 text-center backdrop-blur-xl">
            <p className="mb-2 text-2xl tracking-tight text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>No websites found</p>
            <p className="mb-6 text-white/40">Try a different search or category.</p>
            <Link href="/marketplace" className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black">
              Clear filters
            </Link>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

function CategoryPill({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-[12px] font-medium transition-all ${
        active
          ? 'border-white bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.12)]'
          : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
