'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'SOLD';
  sales: number;
  rating: number;
  createdAt: string;
  techStack: string[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-emerald-400/10', text: 'text-emerald-700' },
  DRAFT: { bg: 'bg-white/10', text: 'text-foreground/60' },
  PAUSED: { bg: 'bg-amber-400/10', text: 'text-amber-700' },
  SOLD: { bg: 'bg-rose-400/10', text: 'text-rose-700' },
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default function SellerDashboard() {
  const [tab, setTab] = useState<'overview' | 'listings' | 'orders' | 'analytics' | 'create' | 'messages' | 'settings'>('overview');

  // Fully working mock state
  const [listings, setListings] = useState<Listing[]>([
    { id: 'meridian', title: 'Meridian SaaS', price: 299, category: 'SaaS', status: 'ACTIVE', sales: 42, rating: 4.9, createdAt: '2025-04-10', techStack: ['Next.js', 'Tailwind'] },
    { id: 'nocturne', title: 'Nocturne Portfolio', price: 149, category: 'Portfolio', status: 'ACTIVE', sales: 28, rating: 4.8, createdAt: '2025-05-03', techStack: ['React', 'Tailwind'] },
    { id: 'lumina', title: 'Lumina E-commerce', price: 399, category: 'E-commerce', status: 'PAUSED', sales: 19, rating: 5.0, createdAt: '2025-05-20', techStack: ['Next.js', 'Stripe'] },
    { id: 'pulse', title: 'Pulse Dashboard', price: 249, category: 'Dashboard', status: 'DRAFT', sales: 0, rating: 4.6, createdAt: '2025-07-12', techStack: ['React', 'Recharts'] },
  ]);

  const [newListing, setNewListing] = useState({ title: '', price: '', category: 'SaaS', description: '', techStack: '' });
  const [successMsg, setSuccessMsg] = useState(false);

  const active = listings.filter(l => l.status === 'ACTIVE').length;
  const totalSales = listings.reduce((sum, l) => sum + l.sales, 0);
  const revenue = listings.reduce((sum, l) => sum + (l.sales * l.price), 0);
  const avgRating = listings.length ? (listings.reduce((s, l) => s + l.rating, 0) / listings.length).toFixed(1) : '—';

  // Working actions
  const changeStatus = (id: string, newStatus: Listing['status']) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const deleteListing = (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const createListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title || !newListing.price) {
      alert('Title and price are required');
      return;
    }

    const listing: Listing = {
      id: 'l_' + Date.now(),
      title: newListing.title,
      price: parseInt(newListing.price),
      category: newListing.category,
      status: 'DRAFT',
      sales: 0,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0],
      techStack: newListing.techStack ? newListing.techStack.split(',').map(t => t.trim()) : ['Next.js'],
    };

    setListings(prev => [listing, ...prev]);
    setNewListing({ title: '', price: '', category: 'SaaS', description: '', techStack: '' });
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
      setTab('listings');
    }, 1200);
  };

  return (
    <DashboardLayout role="SELLER">
      <div className="mb-8">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs tracking-[1.5px] font-semibold text-emerald-900/40">SELLER PORTAL</div>
            <h1 className="dashboard-title">Seller Dashboard</h1>
          </div>
          <Link href="/dashboard/seller?tab=create" onClick={() => setTab('create')} className="btn-forest hidden md:flex items-center gap-2 text-xs">
            <Plus size={14} /> New Listing
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav mb-8">
        {[
          { k: 'overview', l: 'Overview' },
          { k: 'listings', l: 'My Listings' },
          { k: 'orders', l: 'Orders' },
          { k: 'analytics', l: 'Analytics' },
          { k: 'create', l: 'Create' },
          { k: 'messages', l: 'Messages' },
          { k: 'settings', l: 'Settings' },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)} className={`tab-link ${tab === t.k ? 'active' : ''}`}>{t.l}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={Package} label="Active Listings" value={String(active)} accent="emerald" />
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${revenue}`} accent="lime" />
            <StatCard icon={ShoppingBag} label="Total Sales" value={String(totalSales)} accent="amber" />
            <StatCard icon={Star} label="Avg. Rating" value={avgRating} accent="rose" />
          </section>

          {/* Revenue */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold">Revenue Overview</h2>
              <span className="text-xs text-emerald-900/40">All time</span>
            </div>
            <div className="leaf-card rounded-2xl p-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-sm text-emerald-900/40">Total Earnings</div>
                  <div className="text-4xl font-display font-bold tabular-nums">${revenue}</div>
                </div>
                <div className="text-right text-emerald-700 flex items-center gap-1 text-sm">
                  <TrendingUp size={15} /> +{Math.floor(Math.random() * 30) + 14}%
                </div>
              </div>

              <div className="space-y-4">
                {listings.slice(0, 4).map((l) => {
                  const rev = l.sales * l.price;
                  const max = Math.max(...listings.map(x => x.sales * x.price), 1);
                  const pct = Math.max((rev / max) * 100, 6);
                  return (
                    <div key={l.id} className="flex items-center gap-4">
                      <div className="w-36 text-xs truncate text-emerald-900/70">{l.title}</div>
                      <div className="flex-1 h-2.5 bg-emerald-50/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1f3d47] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="font-semibold text-sm w-16 text-right tabular-nums">${rev}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Top Listings */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold">Top Listings</h2>
              <button onClick={() => setTab('listings')} className="text-xs flex items-center gap-1 text-emerald-900/50 hover:text-emerald-900">View all <ArrowUpRight size={11} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {listings.slice(0, 4).map((l) => {
                const s = STATUS_STYLES[l.status];
                return (
                  <div key={l.id} onClick={() => setTab('listings')} className="leaf-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-emerald-50/20 transition">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <ListingThumbnail listing={l as any} showChrome={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold truncate">{l.title}</div>
                        <span className={`text-[10px] px-2 py-px rounded-full ${s.bg} ${s.text}`}>{l.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-emerald-900/50 mt-1">
                        <span className="flex items-center gap-1"><Star size={10} fill="currentColor" className="text-amber-700" />{l.rating}</span>
                        <span>{l.sales} sales</span>
                        <span>${l.price}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* LISTINGS */}
      {tab === 'listings' && (
        <section>
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">My Listings</h2>
            <Link href="#" onClick={() => setTab('create')} className="btn-forest px-5 py-2 text-sm inline-flex items-center gap-1">
              <Plus size={14} /> New Listing
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map(l => {
                const s = STATUS_STYLES[l.status];
                return (
                  <div key={l.id} className="leaf-card rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-emerald-50/5">
                        <ListingThumbnail listing={l as any} showChrome={false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Link href={`/listing/${l.id}`} className="font-display text-lg font-semibold hover:text-emerald-900/80">{l.title}</Link>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>{l.status}</span>
                        </div>

                        <div className="text-xs mt-0.5 text-emerald-900/40">{l.category} · ${l.price}</div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-4">
                          <div><span className="text-emerald-900/30">Sales</span><div className="font-semibold">{l.sales}</div></div>
                          <div><span className="text-emerald-900/30">Revenue</span><div className="font-semibold">${(l.sales * l.price)}</div></div>
                          <div><span className="text-emerald-900/30">Rating</span><div className="flex items-center gap-1"><Star size={10} fill="currentColor" className="text-amber-700" /> {l.rating}</div></div>
                          <div><span className="text-emerald-900/30">Created</span><div>{formatDate(l.createdAt)}</div></div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {l.status === 'DRAFT' && <button onClick={() => changeStatus(l.id, 'ACTIVE')} className="px-4 py-1 text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-700 rounded-full">Publish</button>}
                          {l.status === 'ACTIVE' && <button onClick={() => changeStatus(l.id, 'PAUSED')} className="px-4 py-1 text-xs bg-amber-400/10 border border-amber-400/20 text-amber-700 rounded-full">Pause</button>}
                          {l.status === 'PAUSED' && <button onClick={() => changeStatus(l.id, 'ACTIVE')} className="px-4 py-1 text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-700 rounded-full">Reactivate</button>}

                          <button onClick={() => alert('Edit feature coming in next release')} className="px-3 py-1 text-xs border rounded-full border-emerald-900/15">Edit</button>
                          <Link href={`/listing/${l.id}`} className="px-3 py-1 text-xs border rounded-full border-emerald-900/15 flex items-center gap-1"><Eye size={12} />Preview</Link>
                          <button onClick={() => deleteListing(l.id)} className="px-3 py-1 text-xs text-rose-700 border border-rose-400/20 rounded-full flex items-center gap-1"><Trash2 size={12} />Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">No listings yet. Create your first one.</div>
          )}
        </section>
      )}

      {/* ORDERS */}
      {tab === 'orders' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Order Management</h2>
          <div className="leaf-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50/5 text-xs uppercase tracking-widest text-emerald-900/40">
                <tr><th className="p-5 text-left">Listing</th><th className="p-5">Sales</th><th className="p-5">Revenue</th><th className="p-5">Status</th></tr>
              </thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id} className="border-t border-emerald-50/5 hover:bg-emerald-50/5">
                    <td className="p-5 font-medium">{l.title}</td>
                    <td className="p-5 text-center">{l.sales}</td>
                    <td className="p-5 text-center font-semibold">${l.sales * l.price}</td>
                    <td className="p-5 text-center"><span className={`status-pill ${STATUS_STYLES[l.status].bg} ${STATUS_STYLES[l.status].text}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ANALYTICS */}
      {tab === 'analytics' && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="leaf-card p-6"><div className="text-xs text-emerald-900/40">Total Revenue</div><div className="text-3xl font-display font-bold mt-2">${revenue}</div></div>
            <div className="leaf-card p-6"><div className="text-xs text-emerald-900/40">Total Sales</div><div className="text-3xl font-display font-bold mt-2">{totalSales}</div></div>
            <div className="leaf-card p-6"><div className="text-xs text-emerald-900/40">Avg Rating</div><div className="text-3xl font-display font-bold mt-2">{avgRating}</div></div>
          </div>

          <div className="leaf-card mt-6 p-6">
            <h3 className="font-bold mb-4">Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><div className="text-2xl font-display font-bold">{active}</div><div className="text-xs text-emerald-900/40">Active</div></div>
              <div><div className="text-2xl font-display font-bold">{listings.filter(l => l.status === 'DRAFT').length}</div><div className="text-xs text-emerald-900/40">Drafts</div></div>
              <div><div className="text-2xl font-display font-bold">{listings.filter(l => l.status === 'PAUSED').length}</div><div className="text-xs text-emerald-900/40">Paused</div></div>
              <div><div className="text-2xl font-display font-bold">{listings.length}</div><div className="text-xs text-emerald-900/40">Total Listings</div></div>
            </div>
          </div>
        </section>
      )}

      {/* CREATE LISTING */}
      {tab === 'create' && (
        <div className="max-w-xl">
          <h2 className="text-2xl font-display font-bold mb-6">Create New Listing</h2>

          {successMsg && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">Listing created successfully! It is in DRAFT status.</div>
          )}

          <form onSubmit={createListing} className="space-y-5 leaf-card p-7 rounded-2xl">
            <div>
              <label className="block text-xs mb-1.5 text-emerald-900/50">Website Title</label>
              <input value={newListing.title} onChange={e => setNewListing({ ...newListing, title: e.target.value })} className="w-full rounded-xl bg-white border border-emerald-900/10 px-4 py-3" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5 text-emerald-900/50">Price (USD)</label>
                <input type="number" value={newListing.price} onChange={e => setNewListing({ ...newListing, price: e.target.value })} className="w-full rounded-xl bg-white border border-emerald-900/10 px-4 py-3" required />
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-emerald-900/50">Category</label>
                <select value={newListing.category} onChange={e => setNewListing({ ...newListing, category: e.target.value })} className="w-full rounded-xl bg-white border border-emerald-900/10 px-4 py-3">
                  {['SaaS', 'Portfolio', 'E-commerce', 'Blog', 'Dashboard', 'Agency'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5 text-emerald-900/50">Description</label>
              <textarea value={newListing.description} onChange={e => setNewListing({ ...newListing, description: e.target.value })} rows={3} className="w-full rounded-xl bg-white border border-emerald-900/10 px-4 py-3" />
            </div>

            <div>
              <label className="block text-xs mb-1.5 text-emerald-900/50">Tech Stack (comma separated)</label>
              <input value={newListing.techStack} onChange={e => setNewListing({ ...newListing, techStack: e.target.value })} className="w-full rounded-xl bg-white border border-emerald-900/10 px-4 py-3" placeholder="Next.js, Tailwind, Stripe" />
            </div>

            <button type="submit" className="btn-forest w-full py-3 text-sm">Create Listing</button>
          </form>
        </div>
      )}

      {/* MESSAGES */}
      {tab === 'messages' && (
        <div className="leaf-card rounded-2xl p-12 text-center">
          <MessageSquare size={44} className="mx-auto mb-4 text-emerald-900/20" />
          <div className="font-semibold">No messages yet</div>
          <p className="text-emerald-900/50 text-sm mt-1">Buyer conversations will appear here.</p>
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <div className="max-w-lg">
          <h2 className="text-2xl font-display font-bold mb-6">Seller Settings</h2>
          <div className="leaf-card rounded-2xl p-6 mb-4">
            <h3 className="font-bold mb-4">Profile</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Name</span> <span className="text-emerald-900/60">Sarah K.</span></div>
              <div className="flex justify-between"><span>Email</span> <span className="text-emerald-900/60">seller@webmers.io</span></div>
            </div>
          </div>
          <div className="leaf-card rounded-2xl p-6 text-xs text-emerald-900/50">
            Payouts are reviewed manually. Your earnings are paid via UPI/PayPal after each successful order.
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, accent }: any) {
  const color = accent === 'emerald' ? 'text-emerald-700' : accent === 'lime' ? 'text-lime-700' : accent === 'amber' ? 'text-amber-700' : 'text-rose-700';
  return (
    <div className="stat-card">
      <div className="flex gap-2 items-center mb-2 text-xs text-emerald-900/40">
        <Icon size={18} className={color} /> {label}
      </div>
      <div className="text-3xl font-display font-bold">{value}</div>
    </div>
  );
}
