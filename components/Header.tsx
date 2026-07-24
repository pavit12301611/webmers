'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Leaf, LogIn, LogOut } from 'lucide-react';

function dashboardHref(role?: string) {
  if (role === 'ADMIN') return '/dashboard/admin';
  if (role === 'SELLER') return '/dashboard/seller';
  return '/dashboard/buyer';
}

/** Sticky, auth-aware top navigation with a light nature-inspired glass finish. */
export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 pt-3">
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-5 flex items-center justify-between rounded-full border border-emerald-100/10 bg-[#07130e]/72 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
        <Link href="/" className="group inline-flex items-center gap-2 font-display text-xl md:text-2xl font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-100 via-lime-200 to-emerald-500 text-[#07130e] shadow-[0_0_32px_rgba(134,201,117,0.24)] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
            <Leaf size={18} fill="currentColor" />
          </span>
          <span>Webmers</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm text-emerald-50/62">
          <Link href="/marketplace" className="rounded-full px-4 py-2 hover:bg-white/[0.06] hover:text-emerald-50 transition-colors">Marketplace</Link>
          <Link href="/editor" className="rounded-full px-4 py-2 hover:bg-white/[0.06] hover:text-emerald-50 transition-colors">Editor</Link>
          <Link href="/#pricing" className="rounded-full px-4 py-2 hover:bg-white/[0.06] hover:text-emerald-50 transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            <div className="h-9 w-24 rounded-full bg-emerald-100/10 animate-pulse" />
          ) : user ? (
            <>
              <Link
                href={dashboardHref(user.role)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-emerald-50/75 border border-emerald-100/10 hover:bg-emerald-100/[0.07] transition-colors"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-emerald-50/55 hover:text-rose-200 hover:bg-rose-400/10 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-emerald-50/75 hover:text-emerald-50 hover:bg-white/[0.05] transition-colors"
              >
                <LogIn size={16} /> <span className="hidden sm:inline">Sign in</span>
              </Link>
              <Link
                href="/auth/signup"
                className="btn-forest px-4 sm:px-5 py-2 text-sm"
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
