import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ListingThumbnail } from '@/components/Thumbnail';
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  Download,
  Heart,
  MessageSquare,
  Package,
  PenTool,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { getBuyerOrders, getListings, getWishlist, type OrderStatus } from '@/lib/data';

export const metadata: Metadata = { title: 'Buyer Dashboard' };

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-white/10', text: 'text-white/70', label: 'Pending' },
  PAID: { bg: 'bg-amber-400/10', text: 'text-amber-300', label: 'Paid · In Escrow' },
  COMPLETED: { bg: 'bg-emerald-400/10', text: 'text-emerald-300', label: 'Completed' },
  REFUNDED: { bg: 'bg-rose-400/10', text: 'text-rose-300', label: 'Refunded' },
  DISPUTED: { bg: 'bg-rose-400/10', text: 'text-rose-300', label: 'Disputed' },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function daysAgo(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

export default async function BuyerDashboard({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  const userId = session.user.id;

  const [orders, wishlist, allListings] = await Promise.all([
    getBuyerOrders(userId),
    getWishlist(userId),
    getListings(),
  ]);
  const listingsById = new Map(allListings.map((l) => [l.id, l]));

  // Only count PAID and COMPLETED orders toward spending
  const totalSpent = orders
    .filter((o) => o.status === 'PAID' || o.status === 'COMPLETED')
    .reduce((s, o) => s + o.amount, 0);
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const activeOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'PENDING').length;

  const tab = searchParams.tab ?? 'overview';

  return (
    <DashboardLayout role="BUYER">
      {tab === 'overview' && (
        <>
          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={String(orders.length)}
              accent="emerald"
            />
            <StatCard
              icon={Package}
              label="Websites Owned"
              value={String(completedCount)}
              accent="lime"
            />
            <StatCard
              icon={Heart}
              label="Wishlist"
              value={String(wishlist.length)}
              accent="rose"
            />
            <StatCard
              icon={CreditCard}
              label="Total Spent"
              value={`$${totalSpent.toLocaleString()}`}
              accent="amber"
            />
          </section>

          {/* Active Orders Alert */}
          {activeOrders > 0 && (
            <div className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-200 mb-1">
                    {activeOrders} {activeOrders === 1 ? 'order' : 'orders'} in escrow
                  </h3>
                  <p className="text-sm text-emerald-50/50">
                    Funds are held for 72 hours. Confirm satisfaction to release payment to the seller.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold">Recent Orders</h2>
              {orders.length > 3 && (
                <Link
                  href="/dashboard/buyer?tab=websites"
                  className="text-xs text-emerald-50/50 hover:text-emerald-50 flex items-center gap-1"
                >
                  View all <ArrowUpRight size={12} />
                </Link>
              )}
            </div>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => {
                  const listing = listingsById.get(order.listingId);
                  const s = STATUS_STYLES[order.status];
                  return (
                    <div
                      key={order.id}
                      className="leaf-card rounded-2xl p-5 transition-all hover:border-emerald-50/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="hidden sm:block w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          {listing ? (
                            <ListingThumbnail listing={listing} showChrome={false} />
                          ) : (
                            <div className="w-full h-full bg-emerald-50/10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-display font-semibold truncate">
                                {order.listingTitle}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-emerald-50/40">
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span>·</span>
                                <span>Layout: {order.layoutChoice}</span>
                              </div>
                            </div>
                            <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
                              {s.label}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-semibold text-emerald-50">
                              ${order.amount}
                            </span>
                            {order.codeUnlocked && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 flex items-center gap-1">
                                <Download size={10} /> Code unlocked
                              </span>
                            )}
                            <div className="flex-1" />
                            <Link
                              href="/editor"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/5 border border-emerald-50/10 text-[11px] font-medium hover:bg-emerald-50/10 transition-colors"
                            >
                              <PenTool size={12} /> Open Editor
                            </Link>
                            {listing && (
                              <Link
                                href={`/listing/${listing.id}`}
                                className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50/5 border border-emerald-50/10 text-[11px] font-medium hover:bg-emerald-50/10 transition-colors"
                              >
                                View
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No orders yet"
                message="Browse the marketplace to buy your first website."
                cta={{ label: 'Browse marketplace', href: '/marketplace' }}
              />
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-display font-bold mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickAction
                href="/marketplace"
                icon={ShoppingBag}
                label="Browse Sites"
                desc="Find your next website"
              />
              <QuickAction
                href="/editor"
                icon={PenTool}
                label="Visual Editor"
                desc="Edit your websites"
              />
              <QuickAction
                href="/dashboard/buyer?tab=wishlist"
                icon={Heart}
                label="Wishlist"
                desc={`${wishlist.length} saved`}
              />
              <QuickAction
                href="/dashboard/buyer?tab=messages"
                icon={MessageSquare}
                label="Messages"
                desc="Contact sellers"
              />
            </div>
          </section>
        </>
      )}

      {tab === 'websites' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">My Websites</h2>
            <span className="text-sm text-emerald-50/40">{orders.length} orders</span>
          </div>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => {
                const listing = listingsById.get(order.listingId);
                const s = STATUS_STYLES[order.status];
                const days = daysAgo(order.createdAt);
                return (
                  <div
                    key={order.id}
                    className="leaf-card rounded-2xl p-5 transition-all hover:border-emerald-50/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0">
                        {listing ? (
                          <ListingThumbnail listing={listing} showChrome={false} />
                        ) : (
                          <div className="w-full h-full bg-emerald-50/10 flex items-center justify-center text-emerald-50/30">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <h3 className="font-display text-lg font-semibold truncate">
                              {order.listingTitle}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-50/40 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />
                                {formatDate(order.createdAt)}
                              </span>
                              <span>·</span>
                              <span>{days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <div className="text-emerald-50/30">Layout</div>
                            <div className="text-emerald-50/70 font-medium">{order.layoutChoice}</div>
                          </div>
                          <div>
                            <div className="text-emerald-50/30">Amount</div>
                            <div className="text-emerald-50 font-semibold">${order.amount}</div>
                          </div>
                          <div>
                            <div className="text-emerald-50/30">Code Unlock</div>
                            <div className={order.codeUnlocked ? 'text-amber-300' : 'text-emerald-50/50'}>
                              {order.codeUnlocked ? 'Included' : 'Not included'}
                            </div>
                          </div>
                          <div>
                            <div className="text-emerald-50/30">Order ID</div>
                            <div className="text-emerald-50/50 font-mono text-[10px]">{order.id.slice(0, 12)}…</div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                          {order.status === 'COMPLETED' && (
                            <Link
                              href="/editor"
                              className="btn-forest px-4 py-2 text-xs"
                            >
                              <PenTool size={12} /> Open Editor
                            </Link>
                          )}
                          {order.status === 'PAID' && (
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-[11px] font-medium text-emerald-300 hover:bg-emerald-400/15 transition-colors">
                              <ShieldCheck size={12} /> Confirm Satisfaction
                            </button>
                          )}
                          {listing && (
                            <Link
                              href={`/listing/${listing.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/5 border border-emerald-50/10 text-[11px] font-medium hover:bg-emerald-50/10 transition-colors"
                            >
                              View Listing
                            </Link>
                          )}
                          {order.codeUnlocked && (
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-medium text-amber-300 hover:bg-amber-400/15 transition-colors">
                              <Download size={12} /> Download Source
                            </button>
                          )}
                        </div>
                      </div>
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
      )}

      {tab === 'wishlist' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Wishlist</h2>
            <span className="text-sm text-emerald-50/40">{wishlist.length} saved</span>
          </div>
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlist.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="group rounded-2xl overflow-hidden border border-emerald-50/10 hover:border-emerald-50/25 transition-all bg-emerald-50/[0.02]"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                      <ListingThumbnail listing={listing} showChrome={false} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-display font-semibold truncate">{listing.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm font-bold text-emerald-50">${listing.price}</div>
                      <div className="text-[11px] text-emerald-50/40">{listing.category}</div>
                    </div>
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
      )}

      {tab === 'messages' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Messages</h2>
          <EmptyState
            title="No messages yet"
            message="Contact a seller from any listing page to start a conversation."
            cta={{ label: 'Browse listings', href: '/marketplace' }}
          />
        </section>
      )}

      {tab === 'settings' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Account Settings</h2>
          <div className="space-y-4">
            <div className="leaf-card rounded-2xl p-6">
              <h3 className="font-display font-bold mb-4">Profile</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-emerald-50/40 block mb-1">Name</label>
                  <div className="px-4 py-3 rounded-xl bg-emerald-50/[0.04] border border-emerald-50/10 text-sm">
                    {session.user.name || '—'}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-emerald-50/40 block mb-1">Email</label>
                  <div className="px-4 py-3 rounded-xl bg-emerald-50/[0.04] border border-emerald-50/10 text-sm">
                    {session.user.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-emerald-50/40 block mb-1">Role</label>
                  <div className="px-4 py-3 rounded-xl bg-emerald-50/[0.04] border border-emerald-50/10 text-sm">
                    {session.user.role}
                  </div>
                </div>
              </div>
            </div>
            <div className="leaf-card rounded-2xl p-6">
              <h3 className="font-display font-bold mb-2">Security</h3>
              <p className="text-sm text-emerald-50/45 mb-4">
                Manage your password and two-factor authentication settings.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/5 border border-emerald-50/10 text-xs font-medium hover:bg-emerald-50/10 transition-colors"
                >
                  Change Password
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  accent: 'emerald' | 'lime' | 'rose' | 'amber';
}) {
  const accentMap = {
    emerald: 'text-emerald-300',
    lime: 'text-lime-300',
    rose: 'text-rose-300',
    amber: 'text-amber-300',
  };
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-3 text-emerald-50/40">
        <Icon size={18} className={accentMap[accent]} />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-display font-bold">{value}</div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: any;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="leaf-card rounded-2xl p-4 transition-all hover:border-emerald-50/20 hover:-translate-y-0.5"
    >
      <Icon size={20} />
      <div className="mt-3 text-sm font-semibold">{label}</div>
      <div className="text-xs text-emerald-50/40 mt-0.5">{desc}</div>
    </Link>
  );
}

function EmptyState({
  title,
  message,
  cta,
}: {
  title: string;
  message: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="text-center py-16 rounded-3xl border border-emerald-50/10 bg-emerald-50/[0.02]">
      <p className="text-xl font-display font-semibold mb-2">{title}</p>
      <p className="text-emerald-50/45 mb-6">{message}</p>
      <Link href={cta.href} className="btn-forest px-6 py-3">
        {cta.label}
      </Link>
    </div>
  );
}
