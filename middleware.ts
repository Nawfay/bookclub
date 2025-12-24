import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = ['/book', '/profile']
const authRoutes = ['/auth/login', '/auth/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is a protected route or root
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || pathname === '/'
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Get the auth token from cookies (PocketBase stores it as 'pb_auth')
  const authToken = request.cookies.get('pb_auth')?.value
  
  // If accessing a protected route without auth token, redirect to login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // If accessing auth routes while authenticated, redirect to home
  if (isAuthRoute && authToken) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }
  
  return NextResponse.next()
}

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