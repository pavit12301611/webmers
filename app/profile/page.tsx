'use client';

import { ShieldCheck, Bell, Key } from 'lucide-react';

export default function ProfilePage() {
  return (
    <main className="bg-background text-foreground px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/50">
          <ShieldCheck size={12} /> Account
        </span>
        <h1 className="text-4xl md:text-6xl tracking-tight mb-6" style={{ fontFamily: 'var(--font-instrument)' }}>
          Profile & Settings
        </h1>
        <p className="text-[15px] leading-7 text-foreground/45 mb-14 max-w-2xl">
          Manage your account details, security preferences, and notification settings.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/80 text-xs font-bold">YOU</div>
              <div>
                <h2 className="text-lg font-display font-bold">Profile</h2>
                <p className="text-[12px] text-foreground/30">Your public identity</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Profile saved (demo)'); }}>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-foreground/40 mb-1.5 block">Name</label>
                <input type="text" defaultValue="Web User" className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-foreground/40 mb-1.5 block">Email</label>
                <input type="email" defaultValue="user@webmers.io" className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
              </div>
              <button type="submit" className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90 transition-colors">Save Profile</button>
            </form>
          </section>

          <section className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/80 text-xs font-bold"><Key size={18} /></div>
              <div>
                <h2 className="text-lg font-display font-bold">Security</h2>
                <p className="text-[12px] text-foreground/30">Passwords and authentication</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Security updated (demo)'); }}>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-foreground/40 mb-1.5 block">Current Password</label>
                <input type="password" className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-foreground/40 mb-1.5 block">New Password</label>
                <input type="password" className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
              </div>
              <button type="submit" className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90 transition-colors">Update Password</button>
            </form>
          </section>

          <section className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-xl md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/80 text-xs font-bold"><Bell size={18} /></div>
              <div>
                <h2 className="text-lg font-display font-bold">Notifications</h2>
                <p className="text-[12px] text-foreground/30">In-app and email preferences</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'New messages', desc: 'When a buyer or seller contacts you.' },
                { label: 'Purchase confirmations', desc: 'When an order is completed or refunded.' },
                { label: 'Price drops', desc: 'When wishlisted items change price.' },
              ].map((n) => (
                <label key={n.label} className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-white/20 transition-colors cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-violet-300 w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium">{n.label}</div>
                    <div className="text-[11px] text-foreground/40">{n.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
