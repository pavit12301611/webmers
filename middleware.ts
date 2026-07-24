import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_SECRET } from '@/lib/auth/secret';

const AUTH_PAGES = ['/auth/signin', '/auth/signup'];

/**
 * Edge middleware responsible for auth-aware routing:
 *
 * - Signed-in users are redirected away from the sign-in / sign-up pages.
 * - `/dashboard/*` is protected and gated by role (BUYER / SELLER / ADMIN).
 *
 * Security headers are applied globally in `next.config.mjs`.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: AUTH_SECRET });

  // Keep already signed-in users away from the auth pages.
  if (token && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Role-based protection for the dashboards.
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = new URL('/auth/signin', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    const role = (token.role as string | undefined) ?? '';
    const isAdmin = role === 'ADMIN';

    if (pathname.startsWith('/dashboard/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/dashboard/seller') && !(role === 'SELLER' || isAdmin)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/dashboard/buyer') && !(role === 'BUYER' || role === 'SELLER' || isAdmin)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
