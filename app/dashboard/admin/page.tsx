import type { Metadata } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import ApproveOrderButton from '@/components/ApproveOrderButton';
import {
  DollarSign,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getAdminStats, getApprovalRequests, getRecentOrders, getRecentUsers } from '@/lib/data';

export const metadata: Metadata = { title: 'Admin Dashboard' };

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export default async function AdminDashboard() {
  const [{ totalUsers, gmv, queue }, recentUsers, recentOrders, approvals] = await Promise.all([
    getAdminStats(),
    getRecentUsers(5),
    getRecentOrders(5),
    getApprovalRequests(),
  ]);

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, accent: 'emerald' as const },
    { label: 'Platform GMV', value: `$${(gmv / 1_000_000).toFixed(1)}M`, icon: TrendingUp, accent: 'lime' as const },
    { label: 'Moderation Queue', value: String(queue), icon: Shield, accent: 'amber' as const },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="leaf-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div><h2 className="text-lg font-display font-bold">Approval Requests</h2><p className="mt-1 text-xs text-emerald-50/40">Review payment references and release orders only after you independently confirm receipt.</p></div>
          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">{approvals.length} pending</span>
        </div>
        {approvals.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-emerald-50/10 text-[11px] uppercase tracking-wider text-emerald-50/35"><tr><th className="pb-3 font-medium">Order</th><th className="pb-3 font-medium">Listing</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Payment reference</th><th className="pb-3 font-medium">Requested</th><th className="pb-3 font-medium">Action</th></tr></thead><tbody className="divide-y divide-emerald-50/5">{approvals.map((order) => <tr key={order.id}><td className="py-3 font-mono text-xs text-emerald-50/60">{order.id}</td><td className="py-3">{order.listingTitle}</td><td className="py-3 font-semibold">₹{order.amount}</td><td className="py-3 font-mono text-xs text-emerald-50/45">{order.paymentReference || 'Awaiting UTR'}</td><td className="py-3 text-emerald-50/45">{formatDate(order.createdAt)}</td><td className="py-3"><ApproveOrderButton orderId={order.id} /></td></tr>)}</tbody></table></div> : <p className="mt-5 rounded-xl border border-emerald-50/8 bg-emerald-50/[0.02] p-4 text-sm text-emerald-50/40">No approval requests are waiting.</p>}
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Recent users */}
        <div className="leaf-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold">Recent Users</h3>
            <Users size={16} className="text-emerald-50/30" />
          </div>
          <ul className="space-y-3">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2 border-b border-emerald-50/5 last:border-0">
                <div>
                  <div className="font-medium text-sm">{u.name}</div>
                  <div className="text-[11px] text-emerald-50/30">{u.email}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50/5 text-emerald-50/50">
                    {u.role}
                  </span>
                  <div className="text-[10px] text-emerald-50/25 mt-1">{formatDate(u.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent transactions */}
        <div className="leaf-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold">Recent Transactions</h3>
            <DollarSign size={16} className="text-emerald-50/30" />
          </div>
          <ul className="space-y-3">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2 border-b border-emerald-50/5 last:border-0">
                <div>
                  <div className="font-medium text-sm">{o.listingTitle}</div>
                  <div className="text-[11px] text-emerald-50/30">
                    {o.status} · {o.layoutChoice}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-display font-semibold">${o.amount}</span>
                  <div className="text-[10px] text-emerald-50/25 mt-0.5">{formatDate(o.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* System health */}
      <section className="leaf-card rounded-2xl p-6">
        <h3 className="text-lg font-display font-bold mb-4">System Health</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'API Response', value: '42ms', status: 'healthy' },
            { label: 'Data Layer', value: process.env.DATABASE_URL ? 'PostgreSQL' : 'In-memory', status: 'healthy' },
            { label: 'Queue Jobs', value: '3 pending', status: 'warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-3 px-4 rounded-xl bg-emerald-50/[0.03] border border-emerald-50/5">
              <span className="text-sm text-emerald-50/50">{s.label}</span>
              <span className={`text-sm font-medium ${s.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </section>
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
  accent: 'emerald' | 'lime' | 'amber';
}) {
  const accentMap = {
    emerald: 'text-emerald-300',
    lime: 'text-lime-300',
    amber: 'text-amber-300',
  };
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-3 text-emerald-50/40">
        <Icon size={18} className={accentMap[accent]} />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-3xl font-display font-bold">{value}</div>
    </div>
  );
}
