import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3, DollarSign, Eye } from 'lucide-react';
import { getSellerStats, type ListingStatus } from '@/lib/data';

export const metadata: Metadata = { title: 'Seller Dashboard' };

const STATUS_STYLES: Record<ListingStatus, string> = {
  ACTIVE: 'bg-emerald-400/10 text-emerald-400',
  DRAFT: 'bg-white/10 text-white/60',
  PAUSED: 'bg-amber-400/10 text-amber-400',
  SOLD: 'bg-rose-400/10 text-rose-400',
};

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  const { active, revenue, views, listings } = await getSellerStats(userId);

  const stats = [
    { label: 'Active Listings', value: String(active), icon: BarChart3 },
    { label: 'Total Revenue', value: `$${revenue.toLocaleString()}`, icon: DollarSign },
    { label: 'Total Views', value: views.toLocaleString(), icon: Eye },
  ];

  return (
    <DashboardLayout role="SELLER">
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

      <section>
        <h2 className="text-2xl font-display font-bold mb-6">My Listings</h2>
        {listings.length > 0 ? (
          <div className="overflow-x-auto rounded-3xl border border-white/10">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white/30 uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Sales</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/listing/${l.id}`} className="font-medium hover:text-white/80 transition-colors">{l.title}</Link>
                      <div className="text-xs text-white/30">{l.category}</div>
                    </td>
                    <td className="px-6 py-4 text-white/60">${l.price}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                    </td>
                    <td className="px-6 py-4 text-white/60">{l.sales}</td>
                    <td className="px-6 py-4 text-white/60">{l.rating.toFixed(1)}★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-xl font-display font-semibold mb-2">No listings yet</p>
            <p className="text-white/40">Your published websites will appear here.</p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
