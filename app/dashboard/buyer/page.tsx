import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { ListingThumbnail } from '@/components/Thumbnail';
import WishlistButton from '@/components/WishlistButton';
import {
  CreditCard,
  ExternalLink,
  Heart,
  Lock,
  PenTool,
  ShieldCheck,
  ShoppingBag,
  Unlock,
} from 'lucide-react';
import {
  escrowStatus,
  getBuyerOrders,
  getBuyerStats,
  getListingsByIds,
  getWishlist,
  type OrderStatus,
} from '@/lib/data';

export const metadata: Metadata = { title: 'Buyer Dashboard' };

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-white/10 text-white/60 ring-white/15',
  PAID: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
  COMPLETED: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
  REFUNDED: 'bg-rose-400/10 text-rose-300 ring-rose-400/25',
  DISPUTED: 'bg-rose-400/10 text-rose-300 ring-rose-400/25',
};

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const dateFmt = (d: Date) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default async function BuyerDashboard() {
  const session = await getSession();
  // Defensive: middleware normally guarantees this, but never assume.
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/dashboard/buyer');
  const userId = session.user.id;

  const [orders, wishlist, stats] = await Promise.all([
    getBuyerOrders(userId),
    getWishlist(userId),
    getBuyerStats(userId),
  ]);

  // Resolve owned listings regardless of status — a purchase stays valid even
  // if the seller later pauses or delists the website.
  const listingsById = await getListingsByIds(orders.map((o) => o.listingId));
  const ownedIds = new Set(orders.filter((o) => o.status !== 'REFUNDED').map((o) => o.listingId));

  return (
    <DashboardLayout role="BUYER">
      {/* Stats */}
      <section className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Websites Owned" value={String(stats.ownedCount)} icon={ShoppingBag} />
        <StatCard label="Total Spent" value={currency(stats.totalSpent)} icon={CreditCard} />
        <StatCard
          label="In Escrow"
          value={String(stats.activeEscrow)}
          icon={ShieldCheck}
          hint={stats.activeEscrow > 0 ? 'Awaiting your confirmation' : 'Nothing pending'}
          tone={stats.activeEscrow > 0 ? 'warning' : 'default'}
        />
        <StatCard label="Wishlist" value={String(stats.wishlistCount)} icon={Heart} />
      </section>

      {/* Owned websites */}
      <section className="mb-14">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">My Websites</h2>
          {orders.length > 0 && (
            <span className="text-xs uppercase tracking-[0.16em] text-emerald-50/35">
              {orders.length} order{orders.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {orders.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {orders.map((order) => {
              const listing = listingsById.get(order.listingId);
              const escrow = escrowStatus(order);
              const refunded = order.status === 'REFUNDED';

              return (
                <article
                  key={order.id}
                  className="leaf-card overflow-hidden rounded-[1.6rem]"
                >
                  <div className="flex gap-4 p-5">
                    <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-emerald-50/10">
                      {listing ? (
                        <ListingThumbnail listing={listing} showChrome={false} />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-emerald-950/40 text-[10px] text-emerald-50/30">
                          Unavailable
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <h3 className="truncate font-display text-lg font-semibold">
                          {order.listingTitle}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${STATUS_STYLES[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-emerald-50/40">
                        {order.layoutChoice} · {dateFmt(order.createdAt)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className={refunded ? 'text-emerald-50/40 line-through' : 'font-semibold'}>
                          {currency(order.amount)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-50/45">
                          {order.codeUnlocked ? (
                            <>
                              <Unlock size={12} className="text-[#f4d58d]" /> Source included
                            </>
                          ) : (
                            <>
                              <Lock size={12} /> Editor only
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {escrow.inEscrow && (
                    <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-3 py-2 text-xs text-amber-200/90">
                      <ShieldCheck size={14} className="shrink-0" />
                      Escrow releases in {escrow.hoursRemaining}h — confirm satisfaction before then.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-emerald-50/[0.07] px-5 py-3.5">
                    {!refunded && (
                      <Link
                        href={`/editor?order=${encodeURIComponent(order.id)}`}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-50/12 bg-emerald-50/[0.05] px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-emerald-50/[0.12]"
                      >
                        <PenTool size={13} /> Open Editor
                      </Link>
                    )}
                    {listing && (
                      <Link
                        href={`/listing/${listing.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-50/12 bg-emerald-50/[0.05] px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-emerald-50/[0.12]"
                      >
                        View listing
                      </Link>
                    )}
                    {listing?.demoUrl && !refunded && (
                      <a
                        href={listing.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-50/12 px-3.5 py-1.5 text-xs font-medium text-emerald-50/60 transition-colors hover:text-emerald-50"
                      >
                        <ExternalLink size={13} /> Live demo
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="No websites yet"
            message="Browse the marketplace to buy your first launch-ready website."
            cta={{ label: 'Browse marketplace', href: '/marketplace' }}
          />
        )}
      </section>

      {/* Wishlist */}
      <section>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Wishlist</h2>
          {wishlist.length > 0 && (
            <Link
              href="/marketplace"
              className="text-xs uppercase tracking-[0.16em] text-emerald-50/40 transition-colors hover:text-emerald-50/70"
            >
              Find more →
            </Link>
          )}
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {wishlist.map((listing) => (
              <div key={listing.id} className="group relative">
                <Link
                  href={`/listing/${listing.id}`}
                  className="leaf-card block overflow-hidden rounded-2xl transition-transform hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <ListingThumbnail listing={listing} showChrome={false} />
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-medium">{listing.title}</div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-xs text-emerald-50/45">{currency(listing.price)}</span>
                      {ownedIds.has(listing.id) && (
                        <span className="text-[10px] uppercase tracking-wide text-emerald-300">
                          Owned
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="absolute right-2 top-2">
                  <WishlistButton listingId={listing.id} initial size={14} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            message="Tap the heart on any website to save it for later."
            cta={{ label: 'Explore websites', href: '/marketplace' }}
          />
        )}
      </section>
    </DashboardLayout>
  );
}
