import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tryGetAuthSecret } from '@/lib/auth/secret';

/** Pages a signed-in user has no reason to see. */
const AUTH_PAGES = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

/** Routes that require a session (role checks happen further down). */
const PROTECTED_PREFIXES = ['/dashboard', '/editor', '/checkout/confirmation'];

/**
 * Edge middleware responsible for auth-aware routing:
 *
 * - Signed-in users are redirected away from the auth pages.
 * - `/dashboard/*`, `/editor` and order confirmations require a session.
 * - `/dashboard/*` is additionally gated by role (BUYER / SELLER / ADMIN).
 *
 * Security headers are applied globally in `next.config.mjs`.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Non-throwing: a misconfigured secret must not 500 every public page. With
  // no secret we simply cannot trust any cookie, so treat everyone as signed
  // out — which still fails *closed* for protected routes below.
  const secret = tryGetAuthSecret();
  const token = secret ? await getToken({ req, secret }) : null;

  // Keep already signed-in users away from the auth pages.
  if (token && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAuth && !token) {
    const url = new URL('/auth/signin', req.url);
    // Preserve the query string so e.g. ?order=… survives the round trip.
    url.searchParams.set('callbackUrl', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // Role-based protection for the dashboards.
  if (pathname.startsWith('/dashboard') && token) {
    const role = (token.role as string | undefined) ?? '';
    const isAdmin = role === 'ADMIN';

    if (pathname.startsWith('/dashboard/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/dashboard/seller') && !(role === 'SELLER' || isAdmin)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (
      pathname.startsWith('/dashboard/buyer') &&
      !(role === 'BUYER' || role === 'SELLER' || isAdmin)
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/editor/:path*', '/checkout/confirmation'],
};
