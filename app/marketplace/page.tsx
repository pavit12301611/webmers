import Link from 'next/link';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ListingCard from '@/components/ListingCard';
import GridPattern from '@/components/GridPattern';
import { getCategories, getListings, getWishlist } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse fully-built websites ready to buy, edit and own.',
};

const SORTS = [
  { value: 'sales', label: 'Most Sold' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string; sort?: string; min?: string; max?: string };
}) {
  const q = searchParams.q?.trim() ?? '';
  const cat = searchParams.cat ?? 'All';
  const sort = (searchParams.sort as
    | 'sales'
    | 'rating'
    | 'newest'
    | 'price_asc'
    | 'price_desc'
    | undefined) ?? 'sales';
  const minRaw = searchParams.min?.trim();
  const maxRaw = searchParams.max?.trim();
  const minPrice = minRaw && !Number.isNaN(Number(minRaw)) ? Number(minRaw) : undefined;
  const maxPrice = maxRaw && !Number.isNaN(Number(maxRaw)) ? Number(maxRaw) : undefined;

  const [listings, categories, user] = await Promise.all([
    getListings({ category: cat, search: q, sort, minPrice, maxPrice }),
    getCategories(),
    getCurrentUser(),
  ]);

  // Batch wishlist once — was N+1 before
  let wishlistIds = new Set<string>();
  if (user) {
    const wishlist = await getWishlist(user.id);
    wishlistIds = new Set(wishlist.map((l) => l.id));
  }

  // Preserve the active query/filter state when switching categories.
  const buildHref = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (cat !== 'All') p.set('cat', cat);
    if (sort && sort !== 'sales') p.set('sort', sort);
    if (minPrice !== undefined) p.set('min', String(minPrice));
    if (maxPrice !== undefined) p.set('max', String(maxPrice));
    Object.entries(over).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    const s = p.toString();
    return s ? `/marketplace?${s}` : '/marketplace';
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <Header />

      <section className="relative px-6 pb-12 pt-36 md:px-10">
        <GridPattern id="mp-grid" />

        <div className="relative mx-auto max-w-7xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/40">
            Marketplace grove
          </span>
          <h1 className="mb-4 max-w-3xl text-balance text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
            Browse launch-ready websites.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground/45">
            Fully-built websites, ready to launch. Filter by category, sort by what matters, or search for a stack with a measured, precise experience.
          </p>

          <form action="/marketplace" method="get" className="mt-8 flex max-w-3xl flex-col gap-3 rounded-[1.8rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-[#faf8f4]/[0.08] p-4 backdrop-blur-2xl shadow-[0_8px_32px_rgba(143,113,80,0.06),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.12)]">
            {cat !== 'All' && <input type="hidden" name="cat" value={cat} />}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search by name, category or tech…"
                className="w-full rounded-full border border-white/10 bg-gradient-to-b from-[#fffdf9]/20 to-[#faf5ee]/10 px-4 py-3.5 pl-12 pr-4 text-foreground placeholder-foreground/20 outline-none shadow-[inset_0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all focus:border-wander-orange/30 focus:shadow-[inset_0_2px_6px_rgba(0,0,0,0.05),0_0_0_3px_rgba(217,119,43,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
              />
            </div>
            <button type="submit" className="rounded-full bg-gradient-to-b from-[#fffdf9] to-[#faf5ee] px-8 py-3.5 text-sm font-bold text-wander-dark shadow-[0_4px_12px_rgba(143,113,80,0.1),0_1px_4px_rgba(143,113,80,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(143,113,80,0.15),0_2px_6px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-gradient-to-b hover:from-white hover:to-[#f6f0e8]">
              Search
            </button>

            <div className="mt-1 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-3">
              <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-gradient-to-b from-[#fffdf9]/[0.06] to-[#faf5ee]/[0.06] px-4 py-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
                <span className="text-[11px] uppercase tracking-[0.14em] text-foreground/40">Sort</span>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="bg-transparent text-sm text-foreground/80 outline-none appearance-none cursor-pointer"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-background">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-gradient-to-b from-[#fffdf9]/[0.06] to-[#faf5ee]/[0.06] px-4 py-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
                <span className="text-[11px] uppercase tracking-[0.14em] text-foreground/40">Price ₹</span>
                <input
                  type="number"
                  name="min"
                  min={0}
                  placeholder="Min"
                  defaultValue={minRaw ?? ''}
                  className="w-16 bg-transparent text-sm text-foreground/80 outline-none placeholder-foreground/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] rounded-full px-1"
                />
                <span className="text-foreground/30">–</span>
                <input
                  type="number"
                  name="max"
                  min={0}
                  placeholder="Max"
                  defaultValue={maxRaw ?? ''}
                  className="w-16 bg-transparent text-sm text-foreground/80 outline-none placeholder-foreground/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] rounded-full px-1"
                />
              </div>
              <button type="submit" className="rounded-full border border-white/[0.08] bg-gradient-to-b from-[#fffdf9]/[0.06] to-[#faf5ee]/[0.06] px-5 py-2 text-sm text-foreground/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20 hover:text-foreground hover:shadow-[inset_0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]">
                Apply
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            <CategoryPill label="All" active={cat === 'All'} href={buildHref({ cat: undefined })} />
            {categories.map((c) => (
              <CategoryPill
                key={c.name}
                label={`${c.name} (${c.count})`}
                active={cat === c.name}
                href={buildHref({ cat: c.name })}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-32 md:px-10">
        <div className="mb-6 text-[11px] uppercase tracking-[0.18em] text-foreground/30">
          {listings.length} {listings.length === 1 ? 'result' : 'results'}
          {cat !== 'All' && <> in <span className="text-foreground/60">{cat}</span></>}
          {q && <> for <span className="text-foreground/60">“{q}”</span></>}
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} initialWishlisted={wishlistIds.has(listing.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-white/[0.06] bg-gradient-to-b from-[#fffdf9]/[0.04] to-[#faf5ee]/[0.06] py-24 text-center backdrop-blur-2xl shadow-[0_8px_32px_rgba(143,113,80,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <p className="mb-2 text-2xl tracking-tight text-foreground" style={{ fontFamily: 'var(--font-instrument)' }}>No websites found</p>
            <p className="mb-6 text-foreground/40">Try a different search, category or price range.</p>
            <Link href="/marketplace" className="inline-flex rounded-full bg-gradient-to-b from-[#fffdf9] to-[#faf5ee] px-6 py-3 text-sm font-bold text-wander-dark shadow-[0_4px_12px_rgba(143,113,80,0.1),0_1px_4px_rgba(143,113,80,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(143,113,80,0.14),0_2px_6px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
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
      className={`rounded-full border px-4 py-2 text-[12px] font-medium transition-all shadow-[0_2px_6px_rgba(143,113,80,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm ${
        active ? 'border-white bg-gradient-to-b from-[#fffdf9] to-[#faf5ee] text-wander-dark shadow-[0_8px_24px_rgba(255,255,255,0.12),0_2px_6px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]' : 'border-white/10 bg-gradient-to-b from-[#fffdf9]/[0.03] to-[#faf5ee]/[0.03] text-foreground/50 hover:border-white/20 hover:text-foreground hover:shadow-[0_4px_12px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.75)]'
      }`}
    >
      {label}
    </Link>
  );
}
