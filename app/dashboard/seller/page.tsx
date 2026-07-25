import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ListingThumbnail } from '@/components/Thumbnail';
import {
  ArrowUpRight,
  DollarSign,
  Eye,
  MessageSquare,
  Package,
  Pause,
  Play,
  Plus,
  ShoppingBag,
  Star,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { getSellerStats, type ListingStatus } from '@/lib/data';

export const metadata: Metadata = { title: 'Seller Dashboard' };

const STATUS_STYLES: Record<ListingStatus, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-emerald-400/10', text: 'text-emerald-300' },
  DRAFT: { bg: 'bg-white/10', text: 'text-white/60' },
  PAUSED: { bg: 'bg-amber-400/10', text: 'text-amber-300' },
  SOLD: { bg: 'bg-rose-400/10', text: 'text-rose-300' },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export default async function SellerDashboard({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');
  const userId = session.user.id;

  const { active, revenue, views, listings } = await getSellerStats(userId);
  const totalSales = listings.reduce((sum, l) => sum + l.sales, 0);
  const draftCount = listings.filter((l) => l.status === 'DRAFT').length;
  const pausedCount = listings.filter((l) => l.status === 'PAUSED').length;

  // Calculate average rating from listings that have sales
  const activeListings = listings.filter((l) => l.status === 'ACTIVE');
  const avgRating =
    activeListings.length > 0
      ? activeListings.reduce((s, l) => s + l.rating, 0) / activeListings.length
      : 0;

  const tab = searchParams.tab ?? 'overview';

  return (
    <DashboardLayout role="SELLER">
      {tab === 'overview' && (
        <>
          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={Package} label="Active Listings" value={String(active)} accent="emerald" />
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${revenue.toLocaleString()}`} accent="lime" />
            <StatCard icon={ShoppingBag} label="Total Sales" value={String(totalSales)} accent="amber" />
            <StatCard icon={Star} label="Avg. Rating" value={avgRating > 0 ? `${avgRating.toFixed(1)}★` : '—'} accent="rose" />
          </section>

          {/* Revenue Overview */}
          <section className="mb-10">
            <h2 className="text-xl font-display font-bold mb-5">Revenue Overview</h2>
            <div className="leaf-card rounded-2xl p-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-sm text-emerald-50/40">Total Earnings</div>
                  <div className="text-4xl font-display font-bold">${revenue.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-50/40">This period</div>
                  <div className="flex items-center gap-1 text-sm text-emerald-300">
                    <TrendingUp size={14} />
                    <span>+{Math.round((revenue / (revenue + 500)) * 100)}%</span>
                  </div>
                </div>
              </div>
              {/* Simple revenue bar chart by listing */}
              <div className="space-y-3">
                {listings.slice(0, 5).map((l) => {
                  const listingRevenue = l.sales * l.price;
                  const maxRevenue = Math.max(...listings.map((x) => x.sales * x.price), 1);
                  const pct = (listingRevenue / maxRevenue) * 100;
                  return (
                    <div key={l.id} className="flex items-center gap-3">
                      <div className="w-28 text-xs text-emerald-50/60 truncate">{l.title}</div>
                      <div className="flex-1 h-6 rounded-full bg-emerald-50/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500/40 to-lime-400/40 transition-all"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-xs font-semibold text-emerald-50/70">
                        ${listingRevenue.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
                {listings.length === 0 && (
                  <p className="text-sm text-emerald-50/30 text-center py-4">
                    No listings yet. Create your first to start earning.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Top Listings */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold">Top Listings</h2>
              <Link
                href="/dashboard/seller?tab=listings"
                className="text-xs text-emerald-50/50 hover:text-emerald-50 flex items-center gap-1"
              >
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            {listings.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {listings.slice(0, 4).map((l) => {
                  const s = STATUS_STYLES[l.status];
                  return (
                    <Link
                      key={l.id}
                      href={`/listing/${l.id}`}
                      className="leaf-card rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-emerald-50/20"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <ListingThumbnail listing={l} showChrome={false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold truncate">{l.title}</h3>
                          <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                            {l.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-emerald-50/40">
                          <span className="flex items-center gap-1">
                            <Star size={10} fill="currentColor" className="text-amber-300" />
                            {l.rating.toFixed(1)}
                          </span>
                          <span>{l.sales} sales</span>
                          <span>${l.price}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border border-emerald-50/10 bg-emerald-50/[0.02]">
                <p className="text-lg font-display font-semibold mb-2">No listings yet</p>
                <p className="text-emerald-50/45 mb-4">Create your first listing to start selling.</p>
                <Link href="/dashboard/seller?tab=listings" className="btn-forest px-5 py-2.5 text-sm">
                  <Plus size={14} /> Create Listing
                </Link>
              </div>
            )}
          </section>

          {/* Alerts */}
          {(draftCount > 0 || pausedCount > 0) && (
            <section className="grid sm:grid-cols-2 gap-4">
              {draftCount > 0 && (
                <div className="leaf-card rounded-2xl p-5 border-amber-400/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={16} className="text-amber-300" />
                    <span className="font-semibold text-amber-200">{draftCount} draft{draftCount > 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-xs text-emerald-50/45">
                    Publish your drafts to make them visible in the marketplace.
                  </p>
                </div>
              )}
              {pausedCount > 0 && (
                <div className="leaf-card rounded-2xl p-5 border-amber-400/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Pause size={16} className="text-amber-300" />
                    <span className="font-semibold text-amber-200">{pausedCount} paused</span>
                  </div>
                  <p className="text-xs text-emerald-50/45">
                    Reactivate paused listings to resume earning.
                  </p>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {tab === 'listings' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">My Listings</h2>
            <button className="btn-forest px-5 py-2.5 text-sm">
              <Plus size={14} /> New Listing
            </button>
          </div>
          {listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map((l) => {
                const s = STATUS_STYLES[l.status];
                const listingRevenue = l.sales * l.price;
                return (
                  <div key={l.id} className="leaf-card rounded-2xl p-5 transition-all hover:border-emerald-50/20">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:block w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <ListingThumbnail listing={l} showChrome={false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/listing/${l.id}`} className="font-display text-lg font-semibold hover:text-emerald-50/80 transition-colors">
                              {l.title}
                            </Link>
                            <div className="flex items-center gap-3 mt-1 text-xs text-emerald-50/40 flex-wrap">
                              <span>{l.category}</span>
                              <span>·</span>
                              <span>${l.price}</span>
                              <span>·</span>
                              <span>Created {formatDate(l.createdAt)}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
                            {l.status}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <div className="text-emerald-50/30">Sales</div>
                            <div className="text-emerald-50 font-semibold">{l.sales}</div>
                          </div>
                          <div>
                            <div className="text-emerald-50/30">Revenue</div>
                            <div className="text-emerald-50 font-semibold">${listingRevenue.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-emerald-50/30">Rating</div>
                            <div className="flex items-center gap-1">
                              <Star size={10} fill="currentColor" className="text-amber-300" />
                              <span className="text-emerald-50/70">{l.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-emerald-50/30">Tech</div>
                            <div className="text-emerald-50/50 truncate">{l.techStack.slice(0, 2).join(', ')}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          {l.status === 'DRAFT' && (
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-[11px] font-medium text-emerald-300 hover:bg-emerald-400/15 transition-colors">
                              <Play size={12} /> Publish
                            </button>
                          )}
                          {l.status === 'ACTIVE' && (
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-medium text-amber-300 hover:bg-amber-400/15 transition-colors">
                              <Pause size={12} /> Pause
                            </button>
                          )}
                          {l.status === 'PAUSED' && (
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-[11px] font-medium text-emerald-300 hover:bg-emerald-400/15 transition-colors">
                              <Play size={12} /> Reactivate
                            </button>
                          )}
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/5 border border-emerald-50/10 text-[11px] font-medium hover:bg-emerald-50/10 transition-colors">
                            Edit
                          </button>
                          <Link
                            href={`/listing/${l.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/5 border border-emerald-50/10 text-[11px] font-medium hover:bg-emerald-50/10 transition-colors"
                          >
                            <Eye size={12} /> Preview
                          </Link>
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-400/5 border border-rose-400/10 text-[11px] font-medium text-rose-300 hover:bg-rose-400/10 transition-colors">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-emerald-50/10 bg-emerald-50/[0.02]">
              <Package size={40} className="mx-auto text-emerald-50/20 mb-4" />
              <p className="text-xl font-display font-semibold mb-2">No listings yet</p>
              <p className="text-emerald-50/45 mb-6">Create your first listing to start selling websites.</p>
              <button className="btn-forest px-6 py-3">
                <Plus size={14} /> Create Your First Listing
              </button>
            </div>
          )}
        </section>
      )}

      {tab === 'orders' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Order Management</h2>
          {listings.length > 0 ? (
            <div className="leaf-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-emerald-50/30 bg-emerald-50/[0.03]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Listing</th>
                      <th className="px-5 py-3 font-medium">Price</th>
                      <th className="px-5 py-3 font-medium">Sales</th>
                      <th className="px-5 py-3 font-medium">Revenue</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50/5">
                    {listings.map((l) => {
                      const s = STATUS_STYLES[l.status];
                      return (
                        <tr key={l.id} className="hover:bg-emerald-50/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <Link href={`/listing/${l.id}`} className="font-medium hover:text-emerald-50/80 transition-colors">
                              {l.title}
                            </Link>
                            <div className="text-[11px] text-emerald-50/30">{l.category}</div>
                          </td>
                          <td className="px-5 py-4 text-emerald-50/60">${l.price}</td>
                          <td className="px-5 py-4 text-emerald-50/60">{l.sales}</td>
                          <td className="px-5 py-4 font-semibold">${(l.sales * l.price).toLocaleString()}</td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-emerald-50/10 bg-emerald-50/[0.02]">
              <p className="text-xl font-display font-semibold mb-2">No orders yet</p>
              <p className="text-emerald-50/45">Orders will appear here when buyers purchase your listings.</p>
            </div>
          )}
        </section>
      )}

      {tab === 'analytics' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Analytics</h2>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="leaf-card rounded-2xl p-5">
              <div className="text-xs text-emerald-50/40 mb-1">Total Revenue</div>
              <div className="text-3xl font-display font-bold">${revenue.toLocaleString()}</div>
              <div className="text-xs text-emerald-300 mt-1 flex items-center gap-1">
                <TrendingUp size={11} /> All time
              </div>
            </div>
            <div className="leaf-card rounded-2xl p-5">
              <div className="text-xs text-emerald-50/40 mb-1">Total Sales</div>
              <div className="text-3xl font-display font-bold">{totalSales}</div>
              <div className="text-xs text-emerald-50/50 mt-1">
                Across {listings.length} listing{listings.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="leaf-card rounded-2xl p-5 col-span-2 md:col-span-1">
              <div className="text-xs text-emerald-50/40 mb-1">Conversion Rate</div>
              <div className="text-3xl font-display font-bold">
                {totalSales > 0 ? `${Math.min(((totalSales / Math.max(views, 1)) * 100), 100).toFixed(1)}%` : '—'}
              </div>
              <div className="text-xs text-emerald-50/50 mt-1">
                {views.toLocaleString()} estimated views
              </div>
            </div>
          </div>

          {/* Revenue breakdown */}
          <div className="leaf-card rounded-2xl p-6 mb-8">
            <h3 className="font-display font-bold mb-4">Revenue by Listing</h3>
            <div className="space-y-4">
              {listings
                .map((l) => ({ ...l, rev: l.sales * l.price }))
                .sort((a, b) => b.rev - a.rev)
                .map((l) => {
                  const maxRev = Math.max(...listings.map((x) => x.sales * x.price), 1);
                  const pct = (l.rev / maxRev) * 100;
                  return (
                    <div key={l.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-emerald-50/70">{l.title}</span>
                        <span className="font-semibold">${l.rev.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-emerald-50/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {listings.length === 0 && (
                <p className="text-sm text-emerald-50/30 text-center py-4">No data yet.</p>
              )}
            </div>
          </div>

          {/* Performance metrics */}
          <div className="leaf-card rounded-2xl p-6">
            <h3 className="font-display font-bold mb-4">Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-emerald-50/[0.03]">
                <div className="text-2xl font-display font-bold">{active}</div>
                <div className="text-xs text-emerald-50/40">Active</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50/[0.03]">
                <div className="text-2xl font-display font-bold">{draftCount}</div>
                <div className="text-xs text-emerald-50/40">Drafts</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50/[0.03]">
                <div className="text-2xl font-display font-bold">{pausedCount}</div>
                <div className="text-xs text-emerald-50/40">Paused</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50/[0.03]">
                <div className="text-2xl font-display font-bold">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </div>
                <div className="text-xs text-emerald-50/40">Avg Rating</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === 'messages' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Messages</h2>
          <div className="text-center py-16 rounded-3xl border border-emerald-50/10 bg-emerald-50/[0.02]">
            <MessageSquare size={40} className="mx-auto text-emerald-50/20 mb-4" />
            <p className="text-xl font-display font-semibold mb-2">No messages yet</p>
            <p className="text-emerald-50/45">Messages from buyers will appear here.</p>
          </div>
        </section>
      )}

      {tab === 'settings' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Seller Settings</h2>
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
              </div>
            </div>
            <div className="leaf-card rounded-2xl p-6">
              <h3 className="font-display font-bold mb-2">Payout Settings</h3>
              <p className="text-sm text-emerald-50/45 mb-4">
                Configure how you receive payouts from your sales.
              </p>
              <div className="px-4 py-3 rounded-xl bg-emerald-50/[0.04] border border-emerald-50/10 text-sm text-emerald-50/50">
                Stripe Connect — Not connected
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
