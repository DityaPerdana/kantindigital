import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Allow unauthenticated access to public routes
  const publicRoutes = ['/', '/login', '/auth', '/error', '/signup']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/auth/')
  )

  // Also allow test APIs and upload APIs (for testing)
  const isTestAPI = pathname.startsWith('/api/test') || pathname.startsWith('/api/upload')

  // If no user and trying to access protected routes, redirect to login
  if (!user && !isPublicRoute && !isTestAPI) {
    console.log('No user detected, redirecting to login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user exists, handle role-based redirects
  if (user) {
    
    // Fetch user role
    const { data: userData, error } = await supabase
      .from('users')
      .select('role_id')
      .eq('userid', user.id)
      .single()

    const userRole = userData?.role_id
    const isAdmin = userRole === 2
    const isCustomer = userRole === 1

    // Redirect logged-in users from root to their appropriate dashboard
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = isAdmin ? '/dashboard/order' : '/catalog'
      return NextResponse.redirect(url)
    }

    // Redirect /dashboard to /dashboard/order
    if (pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/order'
      return NextResponse.redirect(url)
    }

    // Admin access control
    if (pathname.startsWith('/dashboard')) {
      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/catalog'
        return NextResponse.redirect(url)
      }
    }

    // Customer access control
    if (pathname.startsWith('/catalog')) {
      if (isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/order'
        return NextResponse.redirect(url)
      }
    }

    // If logged in user tries to access login page, redirect based on role
    if (pathname === '/login' || pathname === '/signup') {
      const url = request.nextUrl.clone()
      url.pathname = isAdmin ? '/dashboard/order' : '/catalog'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|ico)$).*)',
  ],
}