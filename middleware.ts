import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Get the session - if it exists, the user is logged in
  const { data: { session } } = await supabase.auth.getSession()
  
  // Get the pathname from the URL
  const { pathname } = request.nextUrl
  
  // If trying to access admin pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // If not logged in, redirect to admin login
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // We allow access to the admin area if logged in
    // The admin layout will handle checking if they're a counsellor
  }
  
  // For non-admin authenticated pages
  if (
    (pathname.startsWith('/dashboard') ||
    pathname.startsWith('/appointments') ||
    pathname.startsWith('/resources') ||
    pathname.startsWith('/forum') ||
    pathname.startsWith('/profile')) && 
    !pathname.startsWith('/admin')
  ) {
    // If not logged in, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  // Allow access to login and public pages
  return res
}

// Match all routes except for static files, api routes, and next.js internals
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
