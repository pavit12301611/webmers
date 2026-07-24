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
    <main className="relative min-h-screen">
      <Header />

      {/* Page head */}
      <section className="relative pt-32 pb-10 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a0a14] to-transparent" />
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-3">Marketplace</h1>
        <p className="text-lg text-white/50 max-w-2xl">
          Fully-built websites, ready to launch. Filter by category or search for a stack.
        </p>

        {/* Search */}
        <form action="/marketplace" method="get" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name, category or tech…"
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          {cat !== 'All' && <input type="hidden" name="cat" value={cat} />}
          <button
            type="submit"
            className="px-7 py-3.5 rounded-full bg-white text-black font-medium hover:scale-[1.02] transition-transform"
          >
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
      <section className="relative pb-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="text-sm text-white/40 mb-6">
          {listings.length} {listings.length === 1 ? 'result' : 'results'}
          {cat !== 'All' && <> in <span className="text-white/70">{cat}</span></>}
          {q && <> for <span className="text-white/70">“{q}”</span></>}
        </div>

        {listings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-2xl font-display font-semibold mb-2">No websites found</p>
            <p className="text-white/40 mb-6">Try a different search or category.</p>
            <Link href="/marketplace" className="px-6 py-3 rounded-full bg-white text-black font-medium">
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
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        active
          ? 'bg-white text-black border-white'
          : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/30 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
