'use client';

import { Bell, Mountain, Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

type HeaderProps = {
  hero?: boolean;
};

function dashboardHref(role?: string) {
  if (role === 'ADMIN') return '/dashboard/admin';
  if (role === 'SELLER') return '/dashboard/seller';
  return '/dashboard/buyer';
}

const WEBMERS_NAV_ITEMS = [
  { label: 'Camping', href: '/marketplace?cat=Camping' },
  { label: 'Hiking', href: '/marketplace?cat=Hiking' },
  { label: 'Backpacks', href: '/marketplace?cat=Backpacks' },
  { label: 'Gear', href: '/marketplace?cat=Gear' },
  { label: 'Footwear', href: '/marketplace?cat=Footwear' },
  { label: 'Accessories', href: '/marketplace?cat=Accessories' },
  { label: 'Sale', href: '/marketplace?filter=sale', isSale: true },
];

const STANDARD_NAV_ITEMS = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Editor', href: '/editor' },
  { label: 'Sell', href: '/sell' },
  { label: 'Blog', href: '/blog' },
  { label: 'Support', href: '/support' },
];

export default function Header({ hero = false }: HeaderProps) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  if (hero) {
    return (
      <>
        <header className="absolute top-0 left-0 right-0 z-50 px-8 py-8 lg:px-16 pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Logo (Left) */}
            <Link href="/" className="flex items-center gap-3 text-wander-dark group">
              <Mountain size={28} className="text-wander-dark transition-transform group-hover:scale-105" />
              <span className="font-bold text-xl uppercase tracking-[0.25em] text-wander-dark font-heading">
                WEBMERS
              </span>
            </Link>

            {/* Links (Center) - Hidden on mobile, flex on large screens */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
              {WEBMERS_NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                    item.isSale ? 'text-wander-orange' : 'text-wander-dark/90'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Icons (Right) */}
            <div className="flex items-center gap-6">
              {searchOpen ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/marketplace?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gear & sites..."
                    autoFocus
                    className="w-40 sm:w-56 rounded-full border border-wander-dark/20 bg-white/80 px-4 py-1.5 text-xs text-wander-dark placeholder-wander-dark/50 outline-none focus:border-wander-orange"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="ml-2 text-wander-dark hover:text-orange-500 text-xs font-semibold"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="text-wander-dark hover:text-orange-500 transition-colors"
                >
                  <Search size={22} />
                </button>
              )}

              {user ? (
                <Link
                  href={dashboardHref(user.role)}
                  title={user.name || user.email || 'Dashboard'}
                  className="text-wander-dark hover:text-orange-500 transition-colors flex items-center gap-1.5"
                >
                  <User size={22} />
                  <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                    Dashboard
                  </span>
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  aria-label="Account"
                  className="text-wander-dark hover:text-orange-500 transition-colors"
                >
                  <User size={22} />
                </Link>
              )}

              <Link
                href="/marketplace"
                aria-label="Cart"
                className="relative flex items-center text-wander-dark hover:text-orange-500 transition-colors"
              >
                <ShoppingCart size={22} />
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-wander-orange text-[10px] font-bold text-white shadow-sm">
                  2
                </span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={open}
                className="lg:hidden text-wander-dark hover:text-orange-500 transition-colors p-1"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        <div
          className={`fixed inset-0 z-[100] bg-wander-bg transition-transform duration-500 ease-in-out ${
            isOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
          aria-hidden={!isOpen}
        >
          <div className="flex justify-between items-center px-8 py-8">
            <Link href="/" onClick={close} className="flex items-center gap-3 text-wander-dark">
              <Mountain size={28} className="text-wander-dark" />
              <span className="font-bold text-xl uppercase tracking-[0.25em] text-wander-dark font-heading">
                WEBMERS
              </span>
            </Link>
            <button
              onClick={close}
              className="p-2 text-wander-dark hover:text-orange-500 transition-colors rounded-full border border-wander-dark/20"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 px-6 pt-12">
            <nav className="flex flex-col items-center gap-6" aria-label="Mobile navigation">
              {WEBMERS_NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  className={`text-2xl font-semibold tracking-wider transition-colors hover:text-orange-500 ${
                    item.isSale ? 'text-wander-orange' : 'text-wander-dark'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 flex flex-col items-center gap-4">
              {user ? (
                <>
                  <Link
                    href={dashboardHref(user.role)}
                    onClick={close}
                    className="rounded-full bg-wander-dark px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-orange-500"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      close();
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-xs uppercase tracking-wider text-wander-dark/70 hover:text-wander-dark"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={close}
                  className="rounded-full bg-wander-dark px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-orange-500"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Non-hero (standard sticky header across other pages)
  return (
    <>
      <header className="sticky top-0 z-50 bg-wander-bg/90 backdrop-blur-md border-b border-wander-dark/10 px-6 py-4 md:px-10">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-wander-dark group">
            <Mountain size={26} className="text-wander-dark transition-transform group-hover:scale-105" />
            <span className="font-bold text-lg uppercase tracking-[0.2em] text-wander-dark font-heading">
              WEBMERS
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {STANDARD_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-wander-dark/80 hover:text-orange-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {user ? (
              <>
                <Link
                  href={dashboardHref(user.role)}
                  className="rounded-full bg-wander-dark px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-orange-500 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs font-medium text-wander-dark/70 hover:text-orange-500 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-xs font-semibold uppercase tracking-wider text-wander-dark hover:text-orange-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/marketplace"
                  className="rounded-full bg-wander-orange px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-orange-500 transition-colors"
                >
                  Marketplace
                </Link>
              </>
            )}

            <button
              onClick={open}
              className="md:hidden text-wander-dark hover:text-orange-500 p-1"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div
        className={`fixed inset-0 z-[100] bg-wander-bg transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex justify-between items-center px-6 py-6">
          <Link href="/" onClick={close} className="flex items-center gap-3 text-wander-dark">
            <Mountain size={26} />
            <span className="font-bold text-lg uppercase tracking-[0.2em] font-heading">
              WEBMERS
            </span>
          </Link>
          <button
            onClick={close}
            className="p-2 text-wander-dark hover:text-orange-500 rounded-full border border-wander-dark/20"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 px-6 pt-12">
          <nav className="flex flex-col items-center gap-6" aria-label="Mobile navigation">
            {STANDARD_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={close}
                className="text-2xl font-medium tracking-wide text-wander-dark hover:text-orange-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
