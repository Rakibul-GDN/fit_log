import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Routes that don't require authentication */
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/forgot-password',
];

/** Routes that should redirect to dashboard if already authenticated */
const authRoutes = ['/login', '/register'];

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Check for session cookie as a lightweight auth check
  const hasSessionCookie = request.cookies.has('authjs.session-token');

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (hasSessionCookie && authRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if no session cookie
  if (!hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
