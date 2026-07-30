'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  LayoutDashboard,
  Leaf,
  MessageSquare,
  Menu,
  Package,
  PenTool,
  Settings,
  ShoppingBag,
  Shield,
  Store,
  Users,
  X,
} from 'lucide-react';
import SignOutButton from './SignOutButton';

export default function DashboardNav({
  role,
}: {
  role: 'BUYER' | 'SELLER' | 'ADMIN';
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const links =
    role === 'BUYER'
      ? [
          { label: 'Overview', href: '/dashboard/buyer', icon: LayoutDashboard },
          { label: 'My Websites', href: '/dashboard/buyer?tab=websites', icon: Package },
          { label: 'Wishlist', href: '/dashboard/buyer?tab=wishlist', icon: ShoppingBag },
          { label: 'Messages', href: '/dashboard/buyer?tab=messages', icon: MessageSquare },
          { label: 'Marketplace', href: '/marketplace', icon: Store },
          { label: 'Visual Editor', href: '/editor', icon: PenTool },
          { label: 'Settings', href: '/dashboard/buyer?tab=settings', icon: Settings },
        ]
      : role === 'SELLER'
      ? [
          { label: 'Overview', href: '/dashboard/seller', icon: LayoutDashboard },
          { label: 'My Listings', href: '/dashboard/seller?tab=listings', icon: Package },
          { label: 'Orders', href: '/dashboard/seller?tab=orders', icon: ShoppingBag },
          { label: 'Analytics', href: '/dashboard/seller?tab=analytics', icon: BarChart3 },
          { label: 'Messages', href: '/dashboard/seller?tab=messages', icon: MessageSquare },
          { label: 'Marketplace', href: '/marketplace', icon: Store },
          { label: 'Settings', href: '/dashboard/seller?tab=settings', icon: Settings },
        ]
      : [
          { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
          { label: 'Approval Requests', href: '/dashboard/admin?tab=approvals', icon: Shield },
          { label: 'Users', href: '/dashboard/admin?tab=users', icon: Users },
          { label: 'Marketplace', href: '/marketplace', icon: Store },
          { label: 'Settings', href: '/dashboard/admin?tab=settings', icon: Settings },
        ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full border border-emerald-50/15 bg-emerald-50/[0.04]"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-[#040d09]/95 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-emerald-50/10 px-4 py-3">
            <div className="inline-flex items-center gap-2 font-display text-xl font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-500 text-[#07130e]">
                <Leaf size={14} fill="currentColor" />
              </span>
              Webmers
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-emerald-50/15"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 py-6">
            <div className="mb-6 rounded-xl border border-emerald-50/10 bg-emerald-50/[0.03] px-4 py-2 text-xs uppercase tracking-widest text-emerald-50/40">
              {role} Dashboard
            </div>
            <nav className="space-y-1">
              {links.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-emerald-50/70 hover:bg-emerald-50/[0.06] hover:text-emerald-50"
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="absolute inset-x-0 bottom-0 border-t border-emerald-50/10 p-4">
            <SignOutButton />
          </div>
        </div>
      )}
    </>
  );
}
