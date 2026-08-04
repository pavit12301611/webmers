'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Star,
} from 'lucide-react';

interface Order {
  id: string;
  listingId: string;
  listingTitle: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED' | 'DISPUTED';
  layoutChoice: string;
  codeUnlocked: boolean;
  createdAt: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-white/10', text: 'text-foreground/70', label: 'Pending' },
  PAID: { bg: 'bg-amber-400/10', text: 'text-amber-700', label: 'Paid · In Escrow' },
  COMPLETED: { bg: 'bg-emerald-400/10', text: 'text-emerald-700', label: 'Completed' },
  REFUNDED: { bg: 'bg-rose-400/10', text: 'text-rose-700', label: 'Refunded' },
  DISPUTED: { bg: 'bg-rose-400/10', text: 'text-rose-700', label: 'Disputed' },
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export default function BuyerDashboard() {
  const [tab, setTab] = useState<'overview' | 'websites' | 'wishlist' | 'reviews' | 'settings'>('overview');

  // Mock data (fully working)
  const [orders, setOrders] = useState<Order[]>([
    { id: 'o_1', listingId: 'meridian', listingTitle: 'Meridian SaaS', amount: 299, status: 'COMPLETED', layoutChoice: 'Hero-Centered', codeUnlocked: true, createdAt: '2025-06-15' },
    { id: 'o_2', listingId: 'nocturne', listingTitle: 'Nocturne Portfolio', amount: 149, status: 'COMPLETED', layoutChoice: 'Split-Screen', codeUnlocked: false, createdAt: '2025-07-02' },
    { id: 'o_3', listingId: 'lumina', listingTitle: 'Lumina E-commerce', amount: 399, status: 'PAID', layoutChoice: 'Video-Hero', codeUnlocked: false, createdAt: '2025-07-29' },
  ]);

  const [wishlist, setWishlist] = useState<Listing[]>([
    { id: 'aurora', title: 'Aurora Blog', price: 89, category: 'Blog' },
    { id: 'atlas', title: 'Atlas Agency', price: 199, category: 'Agency' },
  ]);

  const allListings: Listing[] = [
    { id: 'meridian', title: 'Meridian SaaS', price: 299, category: 'SaaS' },
    { id: 'nocturne', title: 'Nocturne Portfolio', price: 149, category: 'Portfolio' },
    { id: 'lumina', title: 'Lumina E-commerce', price: 399, category: 'E-commerce' },
    { id: 'aurora', title: 'Aurora Blog', price: 89, category: 'Blog' },
    { id: 'atlas', title: 'Atlas Agency', price: 199, category: 'Agency' },
  ];

  const listingsById = new Map(allListings.map((l) => [l.id, l]));

  const totalSpent = orders
    .filter((o) => o.status === 'PAID' || o.status === 'COMPLETED')
    .reduce((s, o) => s + o.amount, 0);

  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const activeOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'PENDING').length;

  // Confirm satisfaction (working)
  const confirmSatisfaction = (orderId: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status: 'COMPLETED' as const } : o
      )
    );
    alert('Thank you! Your satisfaction has been confirmed. Payment released to seller.');
  };

  // Mock review submission
  const [submittedReviews, setSubmittedReviews] = useState<string[]>([]);

  const submitReview = (orderId: string, listingId: string) => {
    setSubmittedReviews(prev => [...prev, orderId]);
    alert('Review submitted successfully. Thank you!');
  };

  return (
    <DashboardLayout role="BUYER">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold tracking-[1.5px] text-emerald-900/40">BUYER PORTAL</div>
            <h1 className="dashboard-title">My Dashboard</h1>
          </div>
          <Link href="/marketplace" className="hidden md:inline-flex btn-secondary text-xs">
            Browse Marketplace <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav mb-8">
        {[
          { k: 'overview', l: 'Overview' },
          { k: 'websites', l: 'My Websites' },
          { k: 'wishlist', l: 'Wishlist' },
          { k: 'reviews', l: 'Reviews' },
          { k: 'settings', l: 'Settings' },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={`tab-link ${tab === t.k ? 'active' : ''}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <>
          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={ShoppingBag} label="Total Orders" value={String(orders.length)} accent="emerald" />
            <StatCard icon={Package} label="Websites Owned" value={String(completedCount)} accent="lime" />
            <StatCard icon={Heart} label="Wishlist" value={String(wishlist.length)} accent="rose" />
            <StatCard icon={CreditCard} label="Total Spent" value={`$${totalSpent}`} accent="amber" />
          </section>

          {/* Escrow alert */}
          {activeOrders > 0 && (
            <div className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-700 mb-1">
                    {activeOrders} {activeOrders === 1 ? 'order' : 'orders'} in escrow
                  </h3>
                  <p className="text-sm text-emerald-900/50">
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
                <Link href="#" onClick={() => setTab('websites')} className="text-xs text-emerald-900/50 hover:text-emerald-900 flex items-center gap-1">
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
                    <div key={order.id} className="leaf-card rounded-2xl p-5 transition-all hover:border-emerald-50/20">
                      <div className="flex items-start gap-4">
                        <div className="hidden sm:block w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          {listing ? <ListingThumbnail listing={listing as any} showChrome={false} /> : <div className="w-full h-full bg-emerald-50/10" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-display font-semibold truncate">{order.listingTitle}</h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-emerald-900/40">
                                <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(order.createdAt)}</span>
                                <span>·</span>
                                <span>Layout: {order.layoutChoice}</span>
                              </div>
                            </div>
                            <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
                              {s.label}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-semibold text-emerald-900">${order.amount}</span>
                            {order.codeUnlocked && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-700 flex items-center gap-1">
                                <Download size={10} /> Code unlocked
                              </span>
                            )}
                            <div className="flex-1" />
                            <Link href="/editor" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/5 border border-emerald-50/10 text-[11px] font-medium hover:bg-emerald-50/10 transition-colors">
                              <PenTool size={12} /> Open Editor
                            </Link>
                            {listing && (
                              <Link href={`/listing/${listing.id}`} className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50/5 border border-emerald-50/10 text-[11px] font-medium hover:bg-emerald-50/10 transition-colors">
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
              <EmptyState title="No orders yet" message="Browse the marketplace to buy your first website." cta={{ label: 'Browse marketplace', href: '/marketplace' }} />
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-display font-bold mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickAction href="/marketplace" icon={ShoppingBag} label="Browse Sites" desc="Find your next website" />
              <QuickAction href="/editor" icon={PenTool} label="Visual Editor" desc="Edit your websites" />
              <QuickAction href="#" onClick={() => setTab('wishlist')} icon={Heart} label="Wishlist" desc={`${wishlist.length} saved`} />
              <QuickAction href="/messages" icon={MessageSquare} label="Messages" desc="Contact sellers" />
            </div>
          </section>
        </>
      )}

      {/* MY WEBSITES TAB */}
      {tab === 'websites' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">My Websites</h2>
            <span className="text-sm text-emerald-900/40">{orders.length} orders</span>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => {
                const listing = listingsById.get(order.listingId);
                const s = STATUS_STYLES[order.status];
                const days = daysAgo(order.createdAt);

                return (
                  <div key={order.id} className="leaf-card rounded-2xl p-5 transition-all hover:border-emerald-50/20">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-emerald-50/10">
                        {listing ? <ListingThumbnail listing={listing as any} showChrome={false} /> : <Package size={28} className="m-auto mt-6 text-emerald-900/30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-display text-lg font-semibold truncate">{order.listingTitle}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-900/40">
                              <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(order.createdAt)}</span>
                              <span>·</span>
                              <span>{days === 0 ? 'Today' : `${days} days ago`}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div><div className="text-emerald-900/30">Layout</div><div className="font-medium">{order.layoutChoice}</div></div>
                          <div><div className="text-emerald-900/30">Amount</div><div className="font-semibold">${order.amount}</div></div>
                          <div><div className="text-emerald-900/30">Code</div><div className={order.codeUnlocked ? 'text-amber-700' : ''}>{order.codeUnlocked ? 'Unlocked' : 'Locked'}</div></div>
                          <div><div className="text-emerald-900/30">Order ID</div><div className="font-mono text-emerald-900/40 text-[10px]">{order.id}</div></div>
                        </div>

                        <div className="mt-4 flex gap-2 flex-wrap">
                          {order.status === 'COMPLETED' && (
                            <Link href="/editor" className="btn-forest px-4 py-1.5 text-xs"><PenTool size={13} /> Open Editor</Link>
                          )}
                          {order.status === 'PAID' && (
                            <button onClick={() => confirmSatisfaction(order.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-[11px] font-medium text-emerald-700 hover:bg-emerald-400/15">
                              <ShieldCheck size={12} /> Confirm Satisfaction
                            </button>
                          )}
                          {listing && (
                            <Link href={`/listing/${listing.id}`} className="btn-secondary px-3 py-1.5 text-xs">View Listing</Link>
                          )}
                          {order.codeUnlocked && (
                            <button className="btn-secondary px-3 py-1.5 text-xs"><Download size={12} /> Download Source</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No websites yet" message="Browse the marketplace to buy your first website." cta={{ label: 'Browse marketplace', href: '/marketplace' }} />
          )}
        </section>
      )}

      {/* WISHLIST TAB */}
      {tab === 'wishlist' && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Wishlist</h2>
            <span className="text-sm text-emerald-900/40">{wishlist.length} saved</span>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlist.map((listing) => (
                <Link key={listing.id} href={`/listing/${listing.id}`} className="group rounded-2xl overflow-hidden border border-emerald-50/10 hover:border-emerald-50/25 transition-all bg-emerald-50/[0.02]">
                  <div className="aspect-[4/3] relative overflow-hidden bg-[#f1ede5]">
                    <ListingThumbnail listing={listing as any} showChrome={false} />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-display font-semibold truncate">{listing.title}</div>
                    <div className="flex items-center justify-between mt-1 text-sm">
                      <div className="font-bold text-emerald-900">${listing.price}</div>
                      <div className="text-[11px] text-emerald-900/40">{listing.category}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Your wishlist is empty" message="Tap the heart on any website to save it for later." cta={{ label: 'Explore websites', href: '/marketplace' }} />
          )}
        </section>
      )}

      {/* REVIEWS TAB */}
      {tab === 'reviews' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Leave Reviews</h2>
          <div className="space-y-6">
            {orders.filter(o => o.status === 'COMPLETED').length > 0 ? (
              orders.filter(o => o.status === 'COMPLETED').map(order => {
                const alreadyReviewed = submittedReviews.includes(order.id);
                return (
                  <div key={order.id} className="leaf-card rounded-2xl p-6">
                    <div className="font-medium">{order.listingTitle}</div>
                    <div className="text-xs text-emerald-900/40 mb-4">Order #{order.id}</div>

                    {alreadyReviewed ? (
                      <div className="text-emerald-700 text-sm">✓ Thank you! Your review was submitted.</div>
                    ) : (
                      <div>
                        <div className="flex gap-1 mb-4">
                          {[1,2,3,4,5].map(n => <Star key={n} size={20} className="text-amber-400" fill="currentColor" />)}
                        </div>
                        <textarea className="w-full rounded-xl bg-white/90 border border-emerald-900/10 p-4 text-sm" placeholder="Share your experience..." rows={3} />
                        <button onClick={() => submitReview(order.id, order.listingId)} className="mt-3 btn-forest text-xs">Submit Review</button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-emerald-900/50">No completed purchases yet to review.</div>
            )}
          </div>
        </section>
      )}

      {/* SETTINGS TAB */}
      {tab === 'settings' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Account Settings</h2>
          <div className="space-y-4 max-w-xl">
            <div className="leaf-card rounded-2xl p-6">
              <h3 className="font-display font-bold mb-4">Profile</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs text-emerald-900/40 block mb-1">Name</label><div className="px-4 py-3 rounded-xl bg-emerald-50/[0.04] border border-emerald-50/10 text-sm">David R.</div></div>
                <div><label className="text-xs text-emerald-900/40 block mb-1">Email</label><div className="px-4 py-3 rounded-xl bg-emerald-50/[0.04] border border-emerald-50/10 text-sm">buyer@webmers.io</div></div>
                <div><label className="text-xs text-emerald-900/40 block mb-1">Role</label><div className="px-4 py-3 rounded-xl bg-emerald-50/[0.04] border border-emerald-50/10 text-sm">BUYER</div></div>
              </div>
            </div>

            <div className="leaf-card rounded-2xl p-6">
              <h3 className="font-display font-bold mb-2">Security</h3>
              <p className="text-sm text-emerald-900/45 mb-4">Manage password and two-factor authentication.</p>
              <Link href="/auth/forgot-password" className="btn-secondary text-xs">Change Password</Link>
            </div>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, accent }: any) {
  const accentMap: any = { emerald: 'text-emerald-700', lime: 'text-lime-700', rose: 'text-rose-700', amber: 'text-amber-700' };
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-3 text-emerald-900/40">
        <Icon size={18} className={accentMap[accent]} />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-display font-bold">{value}</div>
    </div>
  );
}

function QuickAction({ href, onClick, icon: Icon, label, desc }: any) {
  const Comp: any = onClick ? 'button' : Link;
  return (
    <Comp href={href} onClick={onClick} className="leaf-card rounded-2xl p-4 transition-all hover:border-emerald-50/20 hover:-translate-y-0.5 text-left">
      <Icon size={20} />
      <div className="mt-3 text-sm font-semibold">{label}</div>
      <div className="text-xs text-emerald-900/40 mt-0.5">{desc}</div>
    </Comp>
  );
}

function EmptyState({ title, message, cta }: any) {
  return (
    <div className="text-center py-16 rounded-3xl border border-emerald-50/10 bg-emerald-50/[0.02]">
      <p className="text-xl font-display font-semibold mb-2">{title}</p>
      <p className="text-emerald-900/45 mb-6">{message}</p>
      <Link href={cta.href} className="btn-forest px-6 py-3">{cta.label}</Link>
    </div>
  );
}
