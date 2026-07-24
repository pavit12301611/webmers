import DashboardLayout from '@/components/DashboardLayout';
import { ShoppingBag, Heart, CreditCard } from 'lucide-react';

export default function BuyerDashboard() {
  return (
    <DashboardLayout role="BUYER">
      <section className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Websites Owned', value: '3', icon: ShoppingBag },
          { label: 'Wishlist Items', value: '7', icon: Heart },
          { label: 'Total Spent', value: '$748', icon: CreditCard },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4 text-white/30"><stat.icon size={20} /><span className="text-sm">{stat.label}</span></div>
            <div className="text-4xl font-display font-bold">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold mb-6">My Websites</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Meridian SaaS', status: 'Active', price: '$299' },
            { title: 'Lumina E-commerce', status: 'Editing', price: '$399' },
          ].map((w) => (
            <a key={w.title} href="#" className="block p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-display font-semibold">{w.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${w.status === 'Active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>{w.status}</span>
              </div>
              <div className="text-white/30 text-sm">Purchase Price: <span className="text-white font-medium">{w.price}</span></div>
              <div className="mt-4 flex gap-3">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">Visual Editor</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">Edit</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
