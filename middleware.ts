import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect auth routes from logged-in users
    if (token && (path === '/auth/signin' || path === '/auth/signup')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Protect dashboard routes by role
    if (path.startsWith('/dashboard/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (path.startsWith('/dashboard/seller') && !['SELLER', 'ADMIN'].includes(token?.role as string)) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  },
  {
    callbacks: {
      authorized({ token, req }) {
        // Allow public routes
        const publicPaths = ['/', '/auth/signin', '/auth/signup', '/auth/verify', '/api/auth'];
        const isPublic = publicPaths.some(p => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p));
        return isPublic || !!token;
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|public/).*)',
  ],
};
