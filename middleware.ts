import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login'];
  
  // Document paths are public (accessible via QR codes)
  const isDocumentPath = pathname.startsWith('/document/');
  const isPublicApiPath = pathname.startsWith('/api/documents/');
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Allow access to documents, public API, and login page
  if (isDocumentPath || isPublicApiPath || isPublicPath) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|documents).*)',
  ],
};
