import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Simple tracking middleware
  if (pathname.startsWith('/tools/')) {
    // You could trigger a tracking event here
    console.log(`User visiting tool: ${pathname}`);
  }

  // Admin protection (very basic for demo)
  if (pathname.startsWith('/admin/dashboard')) {
    // In a real app, check for auth cookie/token
    // const token = request.cookies.get('admin-token');
    // if (!token) return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/tools/:path*',
    '/admin/:path*',
  ],
};
