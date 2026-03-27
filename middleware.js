import { NextResponse } from 'next/server';
import { readAdminSessionToken } from '@/lib/admin';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('rf_admin_session')?.value;
  const session = readAdminSessionToken(token);
  if (session) return NextResponse.next();

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
