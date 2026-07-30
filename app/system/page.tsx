import { Shield, Activity } from 'lucide-react';

export default function SystemHealthPage() {
  return (
    <main className="bg-[#0a0a0a] text-white px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/50">
          <Shield size={12} /> System
        </span>
        <h1 className="text-4xl md:text-6xl tracking-tight mb-6" style={{ fontFamily: 'var(--font-instrument)' }}>System Health</h1>
        <p className="text-[15px] leading-7 text-white/45 mb-14 max-w-2xl">Real-time monitoring, structured logs, and system status for the Webmers platform.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'API Uptime', value: '99.98%', status: 'Healthy', icon: Activity },
            { label: 'Database', value: 'PostgreSQL', status: 'Connected', icon: Shield },
            { label: 'Error Rate', value: '< 0.01%', status: 'Normal', icon: Activity },
          ].map((s) => (
            <div key={s.label} className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-3">
                <s.icon size={20} className="text-emerald-300" />
                <span className="text-xs text-white/30 uppercase tracking-widest">{s.label}</span>
              </div>
              <div className="text-2xl font-display font-bold mb-1">{s.value}</div>
              <div className="text-[11px] text-emerald-300">{s.status}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
