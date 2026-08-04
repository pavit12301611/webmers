'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ApproveOrderButton from '@/components/ApproveOrderButton';
import {
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  UserCheck,
  Activity,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  gmv: number;
  queue: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Order {
  id: string;
  listingTitle: string;
  amount: number;
  status: string;
  paymentReference?: string | null;
  createdAt: string;
}

interface Approval {
  id: string;
  listingTitle: string;
  amount: number;
  paymentReference?: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'approvals' | 'users' | 'analytics'>('overview');
  const [users, setUsers] = useState<User[]>([
    { id: 'u_admin', name: 'Admin User', email: 'admin@webmers.io', role: 'ADMIN', createdAt: '2025-04-12' },
    { id: 'u_pavit', name: 'Pavit Singh', email: 'pavitsingh1611@gmail.com', role: 'ADMIN', createdAt: '2025-03-22' },
    { id: 'u_seller', name: 'Sarah K.', email: 'seller@webmers.io', role: 'SELLER', createdAt: '2025-05-01' },
    { id: 'u_buyer', name: 'David R.', email: 'buyer@webmers.io', role: 'BUYER', createdAt: '2025-06-10' },
    { id: 'u_maria', name: 'Maria L.', email: 'maria@example.com', role: 'BUYER', createdAt: '2025-07-15' },
  ]);
  const [approvals, setApprovals] = useState<Approval[]>([
    { id: 'o_4', listingTitle: 'Pulse Dashboard', amount: 249, paymentReference: 'UTR9283741', createdAt: '2025-08-01' },
    { id: 'o_5', listingTitle: 'Atlas Agency', amount: 199, paymentReference: null, createdAt: '2025-08-03' },
  ]);
  const [recentOrders] = useState<Order[]>([
    { id: 'o_1', listingTitle: 'Meridian SaaS', amount: 299, status: 'COMPLETED', createdAt: '2025-07-10' },
    { id: 'o_2', listingTitle: 'Nocturne Portfolio', amount: 149, status: 'COMPLETED', createdAt: '2025-07-18' },
    { id: 'o_3', listingTitle: 'Lumina E-commerce', amount: 399, status: 'PAID', createdAt: '2025-08-02' },
  ]);
  const [stats] = useState<AdminStats>({ totalUsers: 187, gmv: 1248000, queue: approvals.length });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Mock action: approve an order
  const handleApprove = async (orderId: string) => {
    if (!confirm('Confirm payment has been verified? This will mark the order as PAID.')) return;

    setApprovals(prev => prev.filter(a => a.id !== orderId));
    
    // simulate refresh
    setTimeout(() => {
      alert('Order approved successfully. Funds released to seller.');
    }, 300);
  };

  // Mock role change
  const changeRole = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    alert(`User role updated to ${newRole}`);
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, accent: 'emerald' },
    { label: 'Platform GMV', value: `$${(stats.gmv / 1_000_000).toFixed(1)}M`, icon: TrendingUp, accent: 'lime' },
    { label: 'Moderation Queue', value: String(stats.queue), icon: Shield, accent: 'amber' },
    { label: 'Active Listings', value: '124', icon: Activity, accent: 'emerald' },
  ];

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[1.5px] font-semibold text-emerald-900/40">PLATFORM CONTROL</div>
            <h1 className="text-4xl font-display font-bold tracking-[-1.5px] text-[#1f3d47]">Admin Dashboard</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs px-4 py-1.5 rounded-full bg-white border border-emerald-900/10">
            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> Live
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav mb-8">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'approvals', label: `Approvals (${approvals.length})` },
          { key: 'users', label: 'Users' },
          { key: 'analytics', label: 'Analytics' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`tab-link ${tab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {statCards.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </section>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Recent Users */}
            <div className="leaf-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title">Recent Users</h3>
                <Link href="#" onClick={() => setTab('users')} className="text-xs text-emerald-900/60 hover:text-emerald-900 flex items-center gap-1">View all →</Link>
              </div>
              <div className="space-y-3 text-sm">
                {users.slice(0, 4).map(u => (
                  <div key={u.id} className="flex justify-between items-center py-1.5 border-b border-[#1f3d47]/5 last:border-none">
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-emerald-900/40">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <span className="status-pill status-active text-xs">{u.role}</span>
                      <div className="text-[10px] text-emerald-900/30 mt-0.5">{formatDate(u.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="leaf-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title">Recent Transactions</h3>
                <DollarSign size={16} className="text-emerald-900/30" />
              </div>
              <div className="space-y-[11px]">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex justify-between items-center text-sm py-1 border-b border-[#1f3d47]/5 last:border-0">
                    <div>
                      <div className="font-medium">{o.listingTitle}</div>
                      <div className="text-xs text-emerald-900/35">{o.status}</div>
                    </div>
                    <div className="text-right font-semibold tabular-nums">₹{o.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="leaf-card rounded-2xl p-6">
            <h3 className="section-title mb-5">Platform Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'API Health', value: '99.8%', sub: '42ms avg', status: 'green' },
                { label: 'Database', value: 'PostgreSQL', sub: 'Healthy', status: 'green' },
                { label: 'Payments', value: '98.4%', sub: 'Escrow ready', status: 'amber' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-[#1f3d47]/8 bg-white/60 px-5 py-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-900/50 text-xs tracking-widest font-medium">{item.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${item.status === 'green' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status.toUpperCase()}</span>
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-tighter text-[#1f3d47]">{item.value}</div>
                  <div className="text-xs text-emerald-900/40">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* APPROVALS */}
      {tab === 'approvals' && (
        <div>
          <div className="leaf-card rounded-2xl p-7 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="section-title">Payment Approval Queue</h3>
                <p className="text-xs text-emerald-900/45 mt-1 max-w-md">Verify buyer UPI / bank transfer manually. Approve only after confirming the payment in your bank account.</p>
              </div>
              <span className="px-4 py-1 text-xs rounded-full bg-amber-400/10 text-amber-700 font-medium">{approvals.length} awaiting</span>
            </div>

            {approvals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-pro min-w-full">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Listing</th>
                      <th>Amount</th>
                      <th>Reference</th>
                      <th>Date</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvals.map(order => (
                      <tr key={order.id}>
                        <td className="font-mono text-xs text-emerald-900/60">{order.id}</td>
                        <td className="font-medium">{order.listingTitle}</td>
                        <td className="font-semibold tabular-nums">₹{order.amount}</td>
                        <td className="font-mono text-xs text-emerald-900/50">{order.paymentReference || '— Awaiting UTR'}</td>
                        <td className="text-emerald-900/50 text-sm">{formatDate(order.createdAt)}</td>
                        <td className="text-right">
                          <button 
                            onClick={() => handleApprove(order.id)}
                            className="btn-forest text-xs px-4 py-1.5">Approve &amp; Release</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-emerald-900/40">All caught up. No pending approvals.</div>
            )}
          </div>

          <p className="text-xs px-1 text-emerald-900/50">Note: Real approvals use bank verification. This is a demo environment.</p>
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="leaf-card rounded-2xl p-7">
          <div className="flex justify-between items-center mb-6">
            <h3 className="section-title">User Management</h3>
            <div className="text-xs text-emerald-900/45">{users.length} total users</div>
          </div>

          <div className="overflow-x-auto">
            <table className="table-pro">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td className="font-mono text-xs text-emerald-900/60">{u.email}</td>
                    <td>
                      <span className={`status-pill ${u.role === 'ADMIN' ? 'status-active' : u.role === 'SELLER' ? 'status-pending' : 'status-draft'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-sm text-emerald-900/50">{u.createdAt}</td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        {u.role !== 'ADMIN' && (
                          <button onClick={() => changeRole(u.id, 'ADMIN')} className="px-3 py-1 text-[10px] rounded-full border text-emerald-700 border-emerald-900/20 hover:bg-emerald-50">Make Admin</button>
                        )}
                        {u.role !== 'SELLER' && (
                          <button onClick={() => changeRole(u.id, 'SELLER')} className="px-3 py-1 text-[10px] rounded-full border text-emerald-700 border-emerald-900/20 hover:bg-emerald-50">Make Seller</button>
                        )}
                        {u.role !== 'BUYER' && (
                          <button onClick={() => changeRole(u.id, 'BUYER')} className="px-3 py-1 text-[10px] rounded-full border text-emerald-700 border-emerald-900/20 hover:bg-emerald-50">Make Buyer</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="leaf-card p-6 lg:col-span-2">
            <h3 className="section-title mb-6">Platform Revenue (Last 90 days)</h3>
            <div className="h-60 flex items-end gap-3 px-1">
              {[34, 52, 41, 78, 65, 92, 68].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-t from-[#1f3d47] to-[#d9772b] rounded-t" style={{ height: `${h}%` }}></div>
                  <div className="text-[10px] text-emerald-900/40 mt-2">W{idx + 1}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-emerald-900/40 mt-3 px-2">
              <div>GMV: <span className="font-semibold text-[#1f3d47]">$1.24M</span></div>
              <div>+28% MoM</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="leaf-card p-6">
              <div className="text-xs text-emerald-900/50">Top Category</div>
              <div className="mt-1 font-display text-3xl font-bold tracking-tighter">SaaS</div>
              <div className="text-xs text-emerald-700">38% of sales</div>
            </div>
            <div className="leaf-card p-6">
              <div className="text-xs text-emerald-900/50">Conversion Rate</div>
              <div className="mt-1 font-display text-3xl font-bold tracking-tighter">18.7%</div>
              <div className="text-xs">+3.1% from last month</div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, accent }: any) {
  const color = accent === 'emerald' ? 'text-emerald-600' : accent === 'lime' ? 'text-lime-600' : 'text-amber-600';
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={18} className={color} />
        <span className="uppercase tracking-[1px] text-[10px] text-emerald-900/40">{label}</span>
      </div>
      <div className="metric">{value}</div>
    </div>
  );
}
