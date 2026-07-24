import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3, DollarSign, Eye } from 'lucide-react';

export default function SellerDashboard() {
  return (
    <DashboardLayout role="SELLER">
      <section className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Active Listings', value: '8', icon: BarChart3 },
          { label: 'Total Revenue', value: '$12,400', icon: DollarSign },
          { label: 'Total Views', value: '3,240', icon: Eye },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4 text-white/30"><stat.icon size={20} /><span className="text-sm">{stat.label}</span></div>
            <div className="text-4xl font-display font-bold">{stat.value}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold mb-6">My Listings</h2>
        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/30 uppercase bg-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { title: 'Meridian SaaS', price: '$299', status: 'Active', sales: 4 },
                { title: 'Nocturne Portfolio', price: '$149', status: 'Active', sales: 2 },
                { title: 'Lumina E-commerce', price: '$399', status: 'Sold', sales: 1 },
              ].map((l) => (
                <tr key={l.title} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium">{l.title}</td>
                  <td className="px-6 py-4 text-white/40">{l.price}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${l.status === 'Active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>{l.status}</span></td>
                  <td className="px-6 py-4 text-white/40">{l.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
