import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { hasConfiguredAuthSecret } from '@/lib/auth/secret';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { Database, Package, Receipt, Shield, TrendingUp, Users, Wallet } from 'lucide-react';
import {
  getAdminStats,
  getRecentOrders,
  getRecentUsers,
  PLATFORM_FEE_RATE,
  type OrderStatus,
} from '@/lib/data';

export const metadata: Metadata = { title: 'Admin Dashboard' };

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

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/dashboard/admin');

  const [stats, recentUsers, recentOrders] = await Promise.all([
    getAdminStats(),
    getRecentUsers(6),
    getRecentOrders(6),
  ]);

  return (
    <DashboardLayout role="ADMIN">
      <section className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          hint={`${stats.buyers} buyers · ${stats.sellers} sellers`}
        />
        <StatCard
          label="Platform GMV"
          value={currency(stats.gmv)}
          icon={TrendingUp}
          hint={`${stats.orderCount} order${stats.orderCount === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Platform Fees"
          value={currency(stats.platformFees)}
          icon={Wallet}
          tone="positive"
          hint={`${Math.round(PLATFORM_FEE_RATE * 100)}% of settled GMV`}
        />
        <StatCard
          label="Refunded"
          value={currency(stats.refunded)}
          icon={Receipt}
          tone={stats.refunded > 0 ? 'negative' : 'default'}
        />
      </section>

      <section className="mb-12 grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Listings"
          value={String(stats.listingCount)}
          icon={Package}
          hint={`${stats.activeListings} active`}
        />
        <StatCard
          label="Moderation Queue"
          value={String(stats.queue)}
          icon={Shield}
          tone={stats.queue > 0 ? 'warning' : 'default'}
          hint={stats.queue > 0 ? 'Drafts awaiting review' : 'Nothing pending'}
        />
        <StatCard
          label="Newsletter"
          value={stats.newsletterCount.toLocaleString()}
          icon={Users}
          hint="Confirmed subscribers"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="leaf-card rounded-[1.6rem] p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Recent Users</h2>
          {recentUsers.length > 0 ? (
            <ul className="divide-y divide-emerald-50/[0.06]">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{u.name}</div>
                    <div className="truncate text-xs text-emerald-50/35">{u.email}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-50/55">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-emerald-50/35">No users registered yet.</p>
          )}
        </div>

        {/* Recent transactions */}
        <div className="leaf-card rounded-[1.6rem] p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Recent Transactions</h2>
          {recentOrders.length > 0 ? (
            <ul className="divide-y divide-emerald-50/[0.06]">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{o.listingTitle}</div>
                    <div className="text-xs text-emerald-50/35">
                      {dateFmt(o.createdAt)} · {o.layoutChoice}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold tabular-nums">{currency(o.amount)}</div>
                    <div
                      className={`text-[10px] font-medium uppercase tracking-wide ${ORDER_STATUS_STYLES[o.status]}`}
                    >
                      {o.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-emerald-50/35">No transactions yet.</p>
          )}
        </div>
      </section>

      {/* System health */}
      <section className="mt-6 leaf-card rounded-[1.6rem] p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">System</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <HealthRow
            icon={Database}
            label="Data Layer"
            value={process.env.DATABASE_URL ? 'PostgreSQL' : 'In-memory + snapshot'}
            healthy
          />
          <HealthRow
            icon={Shield}
            label="Session Secret"
            value={hasConfiguredAuthSecret() ? 'Configured' : 'Dev fallback'}
            healthy={hasConfiguredAuthSecret()}
          />
          <HealthRow
            icon={Receipt}
            label="Email Transport"
            value={process.env.SMTP_HOST ? 'SMTP configured' : 'Ethereal (test)'}
            healthy={!!process.env.SMTP_HOST}
          />
        </div>
      </section>
    </DashboardLayout>
  );
}

function HealthRow({
  icon: Icon,
  label,
  value,
  healthy,
}: {
  icon: typeof Database;
  label: string;
  value: string;
  healthy: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-50/[0.07] bg-emerald-50/[0.02] px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-emerald-50/50">
        <Icon size={15} aria-hidden="true" />
        {label}
      </span>
      <span className={`text-sm font-medium ${healthy ? 'text-emerald-300' : 'text-amber-300'}`}>
        {value}
      </span>
    </div>
  );
}
