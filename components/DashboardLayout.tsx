import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PenTool, ShoppingBag } from 'lucide-react';
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
    <div className="min-h-screen bg-webmers-black text-white flex">
      <aside className="w-72 border-r border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#050505] flex flex-col fixed h-full z-30">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="font-display text-2xl font-bold">Webmers</Link>
          <div className="text-xs text-white/30 mt-1 uppercase tracking-wider">{role} Dashboard</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <SignOutButton />
        </div>
      </aside>

      <main className="ml-72 flex-1 p-8 md:p-12">
        <div className="mb-10 max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-2 capitalize">
            {role} Dashboard
          </h1>
          <p className="text-white/30">
            Welcome back, <span className="text-white/60">{session.user.name || session.user.email}</span>
          </p>
        </div>
        <div className="max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
