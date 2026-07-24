import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import DashboardLayout from '@/components/DashboardLayout';
import { ListingThumbnail } from '@/components/Thumbnail';
import { CreditCard, Heart, PenTool, ShoppingBag } from 'lucide-react';
import { getBuyerOrders, getListings, getWishlist, type OrderStatus } from '@/lib/data';

export const metadata: Metadata = { title: 'Buyer Dashboard' };

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-white/10 text-white/60',
  PAID: 'bg-amber-400/10 text-amber-400',
  COMPLETED: 'bg-emerald-400/10 text-emerald-400',
  REFUNDED: 'bg-rose-400/10 text-rose-400',
  DISPUTED: 'bg-rose-400/10 text-rose-400',
};

export default async function BuyerDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [orders, wishlist, allListings] = await Promise.all([
    getBuyerOrders(userId),
    getWishlist(userId),
    getListings(),
  ]);
  const listingsById = new Map(allListings.map((l) => [l.id, l]));
  const totalSpent = orders.filter((o) => o.status !== 'REFUNDED').reduce((s, o) => s + o.amount, 0);

  const stats = [
    { label: 'Websites Owned', value: String(orders.length), icon: ShoppingBag },
    { label: 'Wishlist Items', value: String(wishlist.length), icon: Heart },
    { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: CreditCard },
  ];

  return (
    <DashboardLayout role="BUYER">
      {/* Stats */}
      <section className="grid md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4 text-white/30">
              <stat.icon size={20} />
              <span className="text-sm">{stat.label}</span>
            </div>
            <div className="text-4xl font-display font-bold">{stat.value}</div>
          </div>
        ))}
      </section>

      {/* My Websites */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold mb-6">My Websites</h2>
        {orders.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {orders.map((order) => {
              const listing = listingsById.get(order.listingId);
              return (
                <div key={order.id} className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-display font-semibold">{order.listingTitle}</h3>
                      <p className="text-xs text-white/30 mt-1">Layout: {order.layoutChoice}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-white/30 text-sm mb-4">
                    Paid: <span className="text-white font-medium">${order.amount}</span>
                    {order.codeUnlocked && <span className="ml-3 text-amber-400/80">· Code unlocked</span>}
                  </div>
                  <div className="flex gap-3">
                    <Link href="/editor" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">
                      <PenTool size={14} /> Open Editor
                    </Link>
                    {listing && (
                      <Link href={`/listing/${listing.id}`} className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">
                        View listing
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No websites yet"
            message="Browse the marketplace to buy your first website."
            cta={{ label: 'Browse marketplace', href: '/marketplace' }}
          />
        )}
      </section>

      {/* Wishlist */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-6">Wishlist</h2>
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlist.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="group rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/25 transition-all">
                <div className="aspect-[4/3]">
                  <ListingThumbnail listing={listing} showChrome={false} />
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{listing.title}</div>
                  <div className="text-xs text-white/40">${listing.price}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your wishlist is empty"
            message="Tap the heart on any website to save it for later."
            cta={{ label: 'Explore websites', href: '/marketplace' }}
          />
        )}
      </section>
    </DashboardLayout>
  );
}

function EmptyState({ title, message, cta }: { title: string; message: string; cta: { label: string; href: string } }) {
  return (
    <div className="text-center py-16 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
      <p className="text-xl font-display font-semibold mb-2">{title}</p>
      <p className="text-white/40 mb-6">{message}</p>
      <Link href={cta.href} className="px-6 py-3 rounded-full bg-white text-black font-medium">
        {cta.label}
      </Link>
    </div>
  );
}
