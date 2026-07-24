import type { Metadata } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import { Shield, TrendingUp, Users } from 'lucide-react';
import { getAdminStats, getRecentOrders, getRecentUsers } from '@/lib/data';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboard() {
  const [{ totalUsers, gmv, queue }, recentUsers, recentOrders] = await Promise.all([
    getAdminStats(),
    getRecentUsers(5),
    getRecentOrders(5),
  ]);

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users },
    { label: 'Platform GMV', value: `$${(gmv / 1_000_000).toFixed(1)}M`, icon: TrendingUp },
    { label: 'Moderation Queue', value: String(queue), icon: Shield },
  ];

  return (
    <DashboardLayout role="ADMIN">
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

      <section className="grid md:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
          <h3 className="text-xl font-display font-bold mb-4">Recent Users</h3>
          <ul className="space-y-3">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-white/30">{u.email}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent transactions */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
          <h3 className="text-xl font-display font-bold mb-4">Recent Transactions</h3>
          <ul className="space-y-3">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="font-medium">{o.listingTitle}</div>
                  <div className="text-xs text-white/30">{o.status} · {o.layoutChoice}</div>
                </div>
                <span className="text-sm font-display font-semibold">${o.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* System health */}
      <section className="mt-6 p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
        <h3 className="text-xl font-display font-bold mb-4">System Health</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'API Response', value: '42ms', status: 'healthy' },
            { label: 'Data Layer', value: process.env.DATABASE_URL ? 'PostgreSQL' : 'In-memory', status: 'healthy' },
            { label: 'Queue Jobs', value: '3 pending', status: 'warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-sm text-white/50">{s.label}</span>
              <span className={`text-sm font-medium ${s.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
