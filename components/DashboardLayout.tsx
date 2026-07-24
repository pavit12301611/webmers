import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Leaf, PenTool, ShoppingBag } from 'lucide-react';
import SignOutButton from './SignOutButton';

/**
 * Shared dashboard shell. Verifies the session and role on the server (in
 * addition to the edge middleware) and renders the sidebar + header.
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

  const basePath = `/dashboard/${role.toLowerCase()}`;
  const navItems = [
    { label: 'Overview', href: basePath, icon: LayoutDashboard },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { label: 'Visual Editor', href: '/editor', icon: PenTool },
  ];

  return (
    <div className="nature-page flex min-h-screen text-emerald-50">
      <aside className="fixed z-30 flex h-full w-72 flex-col border-r border-emerald-50/10 bg-[#07130e]/78 backdrop-blur-2xl">
        <div className="border-b border-emerald-50/8 p-6">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-500 text-[#07130e]"><Leaf size={18} fill="currentColor" /></span>
            Webmers
          </Link>
          <div className="mt-2 text-xs uppercase tracking-wider text-emerald-50/38">{role} Dashboard</div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-emerald-50/55 transition-all hover:bg-emerald-50/[0.06] hover:text-emerald-50"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-emerald-50/8 p-4">
          <SignOutButton />
        </div>
      </aside>

      <main className="ml-72 flex-1 p-8 md:p-12">
        <div className="mb-10 max-w-5xl">
          <span className="section-eyebrow">Dashboard</span>
          <h1 className="mb-2 font-display text-4xl font-bold capitalize tracking-tight md:text-5xl">
            {role} Dashboard
          </h1>
          <p className="text-emerald-50/42">
            Welcome back, <span className="text-emerald-50/70">{session.user.name || session.user.email}</span>
          </p>
        </div>
        <div className="max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
