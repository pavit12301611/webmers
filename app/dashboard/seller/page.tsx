import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { ListingThumbnail } from '@/components/Thumbnail';
import {
  BarChart3,
  DollarSign,
  Package,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  getSellerListingPerformance,
  getSellerStats,
  PLATFORM_FEE_RATE,
  type ListingStatus,
  type OrderStatus,
} from '@/lib/data';

export const metadata: Metadata = { title: 'Seller Dashboard' };

const LISTING_STATUS_STYLES: Record<ListingStatus, string> = {
  ACTIVE: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
  DRAFT: 'bg-white/10 text-white/55 ring-white/15',
  PAUSED: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
  SOLD: 'bg-sky-400/10 text-sky-300 ring-sky-400/25',
};

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'text-white/55',
  PAID: 'text-amber-300',
  COMPLETED: 'text-emerald-300',
  REFUNDED: 'text-rose-300',
  DISPUTED: 'text-rose-300',
};

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const dateFmt = (d: Date) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default async function SellerDashboard() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/dashboard/seller');
  const userId = session.user.id;

  const [stats, performance] = await Promise.all([
    getSellerStats(userId),
    getSellerListingPerformance(userId),
  ]);

  const recentOrders = stats.orders.slice(0, 6);

  return (
    <DashboardLayout role="SELLER">
      {/* Headline metrics */}
      <section className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gross Revenue"
          value={currency(stats.revenue)}
          icon={DollarSign}
          hint={`${currency(stats.revenue30d)} in last 30 days`}
        />
        <StatCard
          label="Net Payout"
          value={currency(stats.netRevenue)}
          icon={Wallet}
          tone="positive"
          hint={`After ${Math.round(PLATFORM_FEE_RATE * 100)}% platform fee`}
        />
        <StatCard
          label="Units Sold"
          value={String(stats.unitsSold)}
          icon={Package}
          hint={stats.avgOrderValue ? `${currency(stats.avgOrderValue)} avg order` : 'No sales yet'}
        />
        <StatCard
          label="Avg Rating"
          value={stats.avgRating ? `${stats.avgRating.toFixed(1)}★` : '—'}
          icon={Star}
          hint={
            stats.reviewCount
              ? `${stats.reviewCount} review${stats.reviewCount === 1 ? '' : 's'}`
              : 'Awaiting reviews'
          }
        />
      </section>

      {/* Secondary metrics */}
      <section className="mb-12 grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Active Listings"
          value={String(stats.active)}
          icon={BarChart3}
          hint={stats.drafts ? `${stats.drafts} draft/paused` : 'All listings live'}
        />
        <StatCard
          label="Best Seller"
          value={stats.topListing ? `${stats.topListing.sales} sales` : '—'}
          icon={TrendingUp}
          hint={stats.topListing?.title ?? 'No sales recorded yet'}
        />
        <StatCard
          label="Refunded"
          value={currency(stats.refunded)}
          icon={DollarSign}
          tone={stats.refunded > 0 ? 'negative' : 'default'}
          hint={stats.refunded > 0 ? 'Deducted from payouts' : 'No refunds'}
        />
      </section>

      {/* Listing performance */}
      <section className="mb-12">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">
          Listing Performance
        </h2>

        {performance.length > 0 ? (
          <div className="leaf-card overflow-hidden rounded-[1.6rem]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Revenue, units sold and rating for each of your listings
                </caption>
                <thead>
                  <tr className="border-b border-emerald-50/[0.08] bg-emerald-50/[0.03] text-[10px] uppercase tracking-[0.14em] text-emerald-50/40">
                    <th scope="col" className="px-5 py-3.5 font-medium">Website</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">Price</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">Sold</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">Revenue</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map(({ listing, revenue, unitsSold, rating, reviewCount }) => (
                    <tr
                      key={listing.id}
                      className="border-b border-emerald-50/[0.05] transition-colors last:border-0 hover:bg-emerald-50/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/listing/${listing.id}`}
                          className="flex items-center gap-3 transition-opacity hover:opacity-80"
                        >
                          <span className="h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-emerald-50/10">
                            <ListingThumbnail listing={listing} showChrome={false} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{listing.title}</span>
                            <span className="block truncate text-xs text-emerald-50/35">
                              {listing.category}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${LISTING_STATUS_STYLES[listing.status]}`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-emerald-50/70">
                        {currency(listing.price)}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-emerald-50/70">
                        {unitsSold}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                        {currency(revenue)}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-emerald-50/70">
                        {reviewCount ? (
                          <span title={`${reviewCount} review${reviewCount === 1 ? '' : 's'}`}>
                            {rating.toFixed(1)}★
                          </span>
                        ) : (
                          <span className="text-emerald-50/25">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No listings yet"
            message="Once you publish a website it will appear here with its live sales performance."
            cta={{ label: 'Browse the marketplace', href: '/marketplace' }}
          />
        )}
      </section>

      {/* Recent orders */}
      <section>
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">Recent Sales</h2>

        {recentOrders.length > 0 ? (
          <ul className="leaf-card divide-y divide-emerald-50/[0.06] rounded-[1.6rem] px-5">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{order.listingTitle}</p>
                  <p className="text-xs text-emerald-50/35">
                    {dateFmt(order.createdAt)} · {order.layoutChoice}
                    {order.codeUnlocked && ' · source included'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      order.status === 'REFUNDED' ? 'text-emerald-50/35 line-through' : ''
                    }`}
                  >
                    {currency(order.amount)}
                  </p>
                  <p
                    className={`text-[10px] font-medium uppercase tracking-wide ${ORDER_STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No sales yet"
            message="When a buyer purchases one of your websites, the order will show up here."
          />
        )}
      </section>
    </DashboardLayout>
  );
}
