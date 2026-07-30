import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Leaf,
  MessageSquare,
  Package,
  PenTool,
  Settings,
  ShoppingBag,
  Shield,
  Store,
  UserCircle,
  Users,
} from 'lucide-react';
import SignOutButton from './SignOutButton';
import DashboardNav from './DashboardNav';

/**
 * Shared dashboard shell. Verifies the session and role on the server (in
 * addition to the edge middleware) and renders the sidebar + header.
 *
 * Now responsive: collapses sidebar on mobile with a hamburger toggle.
 */
export default async function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  const userRole = session.user.role;
  const isAdmin = userRole === 'ADMIN';
  const allowed =
    userRole === role || isAdmin || (role === 'BUYER' && userRole === 'SELLER');
  if (!allowed) redirect('/');

  const userName = session.user.name || session.user.email || 'User';
  const userInitial = (userName[0] || 'U').toUpperCase();

  return (
    <div className="nature-page flex min-h-screen text-emerald-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed z-30 h-full w-72 flex-col border-r border-emerald-50/10 bg-[#07130e]/80 backdrop-blur-2xl">
        <div className="border-b border-emerald-50/8 p-6">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-500 text-[#07130e]">
              <Leaf size={18} fill="currentColor" />
            </span>
            Webmers
          </Link>
          <div className="mt-2 text-xs uppercase tracking-wider text-emerald-50/38">
            {role} Dashboard
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <SidebarLinks role={role} isAdmin={isAdmin} />
        </nav>

        {/* User card */}
        <div className="border-t border-emerald-50/8 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/[0.04] p-3 mb-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 text-sm font-bold text-[#07130e]">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{userName}</div>
              <div className="truncate text-[11px] text-emerald-50/40">{session.user.email}</div>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-emerald-50/10 bg-[#07130e]/90 px-4 backdrop-blur-2xl">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-500 text-[#07130e]">
            <Leaf size={14} fill="currentColor" />
          </span>
          Webmers
        </Link>
        <DashboardNav role={role} isAdmin={isAdmin} />
      </div>

      <main className="flex-1 pt-16 lg:ml-72 lg:pt-0">
        <div className="p-6 md:p-8 lg:p-12">
          <div className="mb-8 max-w-5xl">
            <span className="section-eyebrow">Dashboard</span>
            <h1 className="mb-2 font-display text-3xl font-bold capitalize tracking-tight md:text-4xl lg:text-5xl">
              {role} Dashboard
            </h1>
            <p className="text-emerald-50/42">
              Welcome back,{' '}
              <span className="text-emerald-50/70">{userName}</span>
            </p>
          </div>
          <div className="max-w-5xl">{children}</div>
        </div>
      </main>
    </div>
  );
}

function SidebarLinks({ role, isAdmin }: { role: 'BUYER' | 'SELLER' | 'ADMIN'; isAdmin: boolean }) {
  const baseLinks =
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

  const adminShortcuts = isAdmin
    ? role === 'BUYER'
      ? [
          { label: 'Admin Panel', href: '/dashboard/admin', icon: Shield, isShortcut: true },
          { label: 'Seller Panel', href: '/dashboard/seller', icon: Store, isShortcut: true },
        ]
      : role === 'SELLER'
      ? [
          { label: 'Admin Panel', href: '/dashboard/admin', icon: Shield, isShortcut: true },
          { label: 'Buyer Panel', href: '/dashboard/buyer', icon: ShoppingBag, isShortcut: true },
        ]
      : [
          { label: 'Buyer Dashboard', href: '/dashboard/buyer', icon: ShoppingBag, isShortcut: true },
          { label: 'Seller Dashboard', href: '/dashboard/seller', icon: Store, isShortcut: true },
        ]
    : [];

  const links = [...baseLinks, ...adminShortcuts];

  return (
    <>
      {links.map((item: any) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-emerald-50/[0.06] hover:text-emerald-50 ${
            item.isShortcut
              ? 'text-lime-300 hover:bg-lime-400/10 hover:text-lime-200 border border-lime-400/20 mt-2'
              : 'text-emerald-50/55'
          }`}
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}
    </>
  );
}
