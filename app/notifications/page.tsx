'use client';

import { Bell, Check, MessageCircle, ShoppingCart, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

const notifications = [
  { id: 1, type: 'message', title: 'New message from Sarah K.', desc: 'Thanks for purchasing Meridian SaaS.', time: '2 hours ago', read: false },
  { id: 2, type: 'order', title: 'Order #o_3 payment confirmed', desc: 'Your purchase of Lumina E-commerce is verified.', time: '5 hours ago', read: true },
  { id: 3, type: 'review', title: 'New review on Nocturne Portfolio', desc: 'David R. left a 4-star review.', time: '1 day ago', read: true },
  { id: 4, type: 'wishlist', title: 'Price drop on Aurora Blog', desc: 'The blog theme price dropped from $89 to $79.', time: '2 days ago', read: true },
  { id: 5, type: 'system', title: 'Weekly seller earnings summary', desc: 'Your earnings for this week are ready.', time: '3 days ago', read: false },
];

export default function NotificationsPage() {
  return (
    <main className="bg-background text-white px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl tracking-tight font-display font-bold">Notifications</h1>
          <button
            onClick={() => alert('All notifications marked as read (demo)')}
            className="text-xs text-white/40 hover:text-white underline underline-offset-4"
          >
            Mark all read
          </button>
        </div>
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = n.type === 'message' ? MessageCircle : n.type === 'order' ? ShoppingCart : n.type === 'review' ? Star : n.type === 'wishlist' ? Sparkles : Bell;
            return (
              <Link
                key={n.id}
                href="#"
                className={`flex items-start gap-4 rounded-[1.4rem] border p-5 backdrop-blur-xl transition hover:bg-white/[0.04] ${n.read ? 'bg-white/[0.01] border-white/[0.06]' : 'bg-white/[0.03] border-white/[0.08]'
}`}
              >
                <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${n.read ? 'bg-white/5 text-white/30' : 'bg-rose-400/10 text-rose-300'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-sm font-medium ${n.read ? 'text-white/50' : 'text-white'}`}>{n.title}</h4>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
                  </div>
                  <p className="text-[13px] text-white/40">{n.desc}</p>
                  <p className="text-[11px] text-white/20 mt-1">{n.time}</p>
                </div>
                <div className="shrink-0 text-white/20 hover:text-white transition-colors">
                  <Check size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
