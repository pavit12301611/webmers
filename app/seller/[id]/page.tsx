import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Package, TrendingUp, BadgeCheck } from 'lucide-react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ListingCard from '@/components/ListingCard';
import GridPattern from '@/components/GridPattern';
import { getSellerListings, getUserById } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Seller',
  description: 'Browse websites from this seller on Webmers.',
};

export default async function SellerPage({ params }: { params: { id: string } }) {
  const listings = await getSellerListings(params.id);
  const activeListings = listings.filter((l) => l.status === 'ACTIVE');

  const sellerName =
    activeListings[0]?.sellerName ?? listings[0]?.sellerName ?? (await getUserById(params.id))?.name ?? null;
  if (!sellerName) notFound();

  const avgRating = activeListings.length
    ? activeListings.reduce((sum, l) => sum + l.rating, 0) / activeListings.length
    : 0;
  const totalSales = activeListings.reduce((sum, l) => sum + l.sales, 0);

  const stats = [
    { icon: Package, label: 'Active sites', value: String(activeListings.length) },
    { icon: TrendingUp, label: 'Total sales', value: String(totalSales) },
    { icon: Star, label: 'Avg rating', value: avgRating ? avgRating.toFixed(1) : '—' },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0a0a]">
      <Header />

      <section className="relative px-6 pb-12 pt-36 md:px-10">
        <GridPattern id="seller-grid" />
        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/marketplace"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} /> Back to marketplace
          </Link>

          <div className="mb-10 flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
              <BadgeCheck size={12} /> Seller
            </span>
            <h1 className="text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-6xl" style={{ fontFamily: 'var(--font-instrument)' }}>
              {sellerName}
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-4 md:max-w-2xl">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-[1.4rem] border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-xl">
                  <Icon size={18} className="mb-3 text-white/40" />
                  <div className="text-2xl tracking-tight text-white" style={{ fontFamily: 'var(--font-instrument)' }}>{s.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/40">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-32 md:px-10">
        <h2 className="mb-8 text-2xl tracking-tight text-white md:text-3xl" style={{ fontFamily: 'var(--font-instrument)' }}>
          Sites by {sellerName}
        </h2>

        {activeListings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] py-20 text-center backdrop-blur-xl">
            <p className="text-white/40">No active sites from this seller right now.</p>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
