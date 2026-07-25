import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  LayoutDashboard,
  Leaf,
  PenTool,
  Shield,
  ShoppingBag,
  Store,
} from 'lucide-react';
import SignOutButton from './SignOutButton';

type Role = 'BUYER' | 'SELLER' | 'ADMIN';

const ROLE_LABEL: Record<Role, string> = {
  BUYER: 'Buyer',
  SELLER: 'Seller',
  ADMIN: 'Admin',
};

/**
 * Shared dashboard shell. Verifies the session and role on the server (in
 * addition to the edge middleware) and renders the sidebar + header.
 */
export default async function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  const userRole = session.user.role;
  const isAdmin = userRole === 'ADMIN';
  const allowed = userRole === role || isAdmin || (role === 'BUYER' && userRole === 'SELLER');
  if (!allowed) redirect('/');

  // Sidebar reflects everything this user can actually reach, so sellers and
  // admins can move between their dashboards instead of guessing URLs.
  const navItems = [
    { label: `${ROLE_LABEL[role]} overview`, href: `/dashboard/${role.toLowerCase()}`, icon: LayoutDashboard },
    ...(role !== 'BUYER' ? [{ label: 'My purchases', href: '/dashboard/buyer', icon: Heart }] : []),
    ...(userRole === 'SELLER' && role !== 'SELLER'
      ? [{ label: 'Seller dashboard', href: '/dashboard/seller', icon: Store }]
      : []),
    ...(isAdmin && role !== 'ADMIN'
      ? [{ label: 'Admin dashboard', href: '/dashboard/admin', icon: Shield }]
      : []),
    ...(isAdmin && role !== 'SELLER'
      ? [{ label: 'Seller dashboard', href: '/dashboard/seller', icon: Store }]
      : []),
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { label: 'Visual Editor', href: '/editor', icon: PenTool },
  ];

  return (
    <div className="nature-page flex min-h-screen text-emerald-50">
      <aside className="fixed z-30 hidden h-full w-72 flex-col border-r border-emerald-50/10 bg-[#07130e]/78 backdrop-blur-2xl lg:flex">
        <div className="border-b border-emerald-50/[0.08] p-6">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-500 text-[#07130e]">
              <Leaf size={18} fill="currentColor" aria-hidden="true" />
            </span>
            Webmers
          </Link>
          <div className="mt-2 text-xs uppercase tracking-wider text-emerald-50/38">
            {ROLE_LABEL[role]} Dashboard
          </div>
        </div>

        <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-emerald-50/55 transition-all hover:bg-emerald-50/[0.06] hover:text-emerald-50"
            >
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-emerald-50/[0.08] p-4">
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 lg:ml-72 lg:p-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="section-eyebrow">Dashboard</span>
            <h1 className="mb-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {ROLE_LABEL[role]} Dashboard
            </h1>
            <p className="text-emerald-50/42">
              Welcome back,{' '}
              <span className="text-emerald-50/70">
                {session.user.name || session.user.email}
              </span>
            </p>
          </div>

          {/* Sign-out stays reachable on small screens where the sidebar is hidden. */}
          <div className="lg:hidden">
            <SignOutButton />
          </div>
        </div>

        <div className="max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
