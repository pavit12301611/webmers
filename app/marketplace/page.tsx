import Link from 'next/link';
import type { Metadata } from 'next';
import { Leaf, Search } from 'lucide-react';
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
    <main className="nature-page min-h-screen overflow-hidden">
      <Header />

      {/* Page head */}
      <section className="nature-container relative pt-36 pb-12">
        <div className="absolute left-0 top-20 -z-10 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
        <span className="section-eyebrow"><Leaf size={14} /> Marketplace grove</span>
        <h1 className="mb-4 font-display text-4xl font-bold tracking-tight md:text-6xl">Browse launch-ready websites.</h1>
        <p className="max-w-2xl text-lg leading-8 text-emerald-50/55">
          Fully-built websites, ready to launch. Filter by category or search for a stack with a smooth, lightweight experience.
        </p>

        {/* Search */}
        <form action="/marketplace" method="get" className="leaf-card mt-8 flex max-w-3xl flex-col gap-3 rounded-[2rem] p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-50/35" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name, category or tech…"
              className="w-full rounded-full border border-emerald-50/10 bg-[#07130e]/45 py-4 pl-12 pr-4 text-emerald-50 placeholder-emerald-50/32 outline-none transition-colors focus:border-lime-100/35"
            />
          </div>
          {cat !== 'All' && <input type="hidden" name="cat" value={cat} />}
          <button type="submit" className="btn-forest px-8 py-4">
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
      </section>

      {/* Results */}
      <section className="nature-container relative pb-32">
        <div className="mb-6 text-sm text-emerald-50/42">
          {listings.length} {listings.length === 1 ? 'result' : 'results'}
          {cat !== 'All' && <> in <span className="text-emerald-50/78">{cat}</span></>}
          {q && <> for <span className="text-emerald-50/78">“{q}”</span></>}
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="leaf-card rounded-[2rem] py-24 text-center">
            <p className="mb-2 font-display text-2xl font-semibold">No websites found</p>
            <p className="mb-6 text-emerald-50/45">Try a different search or category.</p>
            <Link href="/marketplace" className="btn-forest px-6 py-3">
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
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'border-lime-100/70 bg-lime-100 text-[#07130e] shadow-[0_10px_34px_rgba(217,249,157,0.14)]'
          : 'border-emerald-50/10 bg-emerald-950/22 text-emerald-50/60 hover:-translate-y-0.5 hover:border-emerald-50/25 hover:text-emerald-50'
      }`}
    >
      {label}
    </Link>
  );
}
