'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

function dashboardHref(role?: string) {
  if (role === 'ADMIN') return '/dashboard/admin';
  if (role === 'SELLER') return '/dashboard/seller';
  return '/dashboard/buyer';
}

const NAV_ITEMS = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Messages', href: '/messages' },
  { label: 'Editor', href: '/editor' },
  { label: 'Plans', href: '#pricing' },
];

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
        <div className="relative flex items-center justify-between px-5 pt-5 md:px-8">
          <Link href="/" className="pointer-events-auto flex items-center gap-3" aria-label="Webmers home">
            <svg viewBox="0 0 256 256" width="28" height="28" fill="white" className="drop-shadow-[0_1px_8px_rgba(255,255,255,0.2)]" aria-hidden="true">
              <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
            </svg>
            <span className="hidden md:inline text-[13px] font-medium uppercase tracking-tight text-white">Webmers</span>
          </Link>

          <nav className="pointer-events-auto fixed left-1/2 top-5 hidden -translate-x-1/2 items-center gap-1 rounded-full px-2 py-1.5 liquid-glass md:flex">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="rounded-full px-4 py-1.5 text-sm font-medium text-white/70 transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pointer-events-auto hidden items-center gap-3 md:flex">
            {status === 'loading' ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
            ) : user ? (
              <>
                <Link href={dashboardHref(user.role)} className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white">
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                  Dashboard
                </Link>
                <Link href="/notifications" className="relative rounded-full p-2 text-white/60 hover:text-white" aria-label="Notifications">
                  <Bell size={18} />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-400 text-[9px] font-bold text-black flex items-center justify-center shadow-lg">3</span>
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="rounded-full px-3 py-2 text-sm text-white/60 hover:text-white">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="rounded-full px-4 py-2 text-sm font-medium text-white/70 hover:text-white">
                  Sign in
                </Link>
                <Link href="/marketplace" className="liquid-glass flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-white">
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                  Reserve Yours
                </Link>
              </>
            )}
          </div>

          <button onClick={open} className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full liquid-glass md:hidden" aria-label="Open menu">
            <div className="flex flex-col items-end gap-1.5">
              <span className="block h-[1.5px] w-5 bg-white" />
              <span className="block h-[1.5px] w-3.5 bg-white" />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[55] bg-[#0a0a0a] transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] ${isOpen ? 'translate-y-0' : '-translate-y-full'}`} aria-hidden={!isOpen}>
        <div className="flex justify-end p-5 md:p-8">
          <button onClick={close} className={`liquid-glass grid h-11 w-11 place-items-center rounded-full ${isOpen ? 'animate-rotate-in' : ''}`} style={{ animationDelay: isOpen ? '80ms' : '0ms' }} aria-label="Close menu">
            <div className="relative h-4 w-4">
              <span className="absolute left-1/2 top-1/2 block h-[1.5px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
              <span className="absolute left-1/2 top-1/2 block h-[1.5px] w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white" />
            </div>
          </button>
        </div>

        <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 px-6 pb-20">
          <nav className="flex flex-col items-center gap-5">
            {NAV_ITEMS.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={close}
                className={`text-3xl font-medium text-white/90 transition hover:text-white sm:text-4xl ${isOpen ? 'animate-slide-up' : 'opacity-0'}`}
                style={{ animationDelay: isOpen ? `${100 + idx * 60}ms` : '0ms' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={`mt-10 ${isOpen ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: isOpen ? `${100 + NAV_ITEMS.length * 60}ms` : '0ms' }}>
            {user ? (
              <button onClick={() => { close(); signOut({ callbackUrl: '/' }); }} className="liquid-glass flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-green-400" /> Sign out
              </button>
            ) : (
              <Link href="/marketplace" onClick={close} className="liquid-glass flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" /> Reserve Yours
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
