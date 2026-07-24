'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, LogIn, LogOut } from 'lucide-react';

function dashboardHref(role?: string) {
  if (role === 'ADMIN') return '/dashboard/admin';
  if (role === 'SELLER') return '/dashboard/seller';
  return '/dashboard/buyer';
}

/** Sticky, auth-aware top navigation. */
export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#050505]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl md:text-2xl font-bold tracking-tight">
          Webmers
        </Link>

        <nav className="hidden sm:flex items-center gap-8 text-sm text-white/50">
          <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
          <Link href="/editor" className="hover:text-white transition-colors">Editor</Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="h-9 w-24 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <>
              <Link
                href={dashboardHref(user.role)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 border border-white/10 hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/50 hover:text-rose-300 hover:bg-rose-400/10 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                <LogIn size={16} /> Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:scale-[1.03] transition-transform"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
