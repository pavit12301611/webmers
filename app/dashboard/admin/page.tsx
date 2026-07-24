import DashboardLayout from '@/components/DashboardLayout';
import { Users, Shield, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <DashboardLayout role="ADMIN">
      <section className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Users', value: '10,247', icon: Users },
          { label: 'Platform GMV', value: '$2.1M', icon: TrendingUp },
          { label: 'Moderation Queue', value: '12', icon: Shield },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4 text-white/30"><stat.icon size={20} /><span className="text-sm">{stat.label}</span></div>
            <div className="text-4xl font-display font-bold">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
          <h3 className="text-xl font-display font-bold mb-4">Recent Users</h3>
          <ul className="space-y-3">
            {[
              { name: 'Sarah K.', email: 'sarah@example.com', role: 'BUYER' },
              { name: 'David R.', email: 'david@example.com', role: 'SELLER' },
              { name: 'Maria L.', email: 'maria@example.com', role: 'BUYER' },
            ].map((u) => (
              <li key={u.email} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-white/30">{u.email}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
          <h3 className="text-xl font-display font-bold mb-4">System Health</h3>
          <div className="space-y-4">
            {[
              { label: 'API Response', value: '42ms', status: 'healthy' },
              { label: 'DB Connections', value: '12 / 50', status: 'healthy' },
              { label: 'Queue Jobs', value: '3 pending', status: 'warning' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-white/50">{s.label}</span>
                <span className={`text-sm font-medium ${s.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
