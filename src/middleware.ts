import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Debug session info
  console.log('=== SESSION DEBUG ===')
  console.log('Pathname:', pathname)
  console.log('User exists:', !!user)
  console.log('User object:', user ? { id: user.id, email: user.email } : null)
  console.log('Cookies:', request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })))
  
  // Allow unauthenticated access to public routes
  const publicRoutes = ['/', '/login', '/auth', '/error', '/signup']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/auth/')
  )

  // If no user and trying to access protected routes, redirect to login
  if (!user && !isPublicRoute) {
    console.log('No user detected, redirecting to login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user exists, handle role-based redirects
  if (user) {
    console.log('User detected, fetching role...')
    
    // Fetch user role
    const { data: userData, error } = await supabase
      .from('users')
      .select('role_id')
      .eq('userid', user.id)
      .single()

    console.log('User role query result:', { userData, error })

    const userRole = userData?.role_id
    const isAdmin = userRole === 2
    const isCustomer = userRole === 1

    console.log('Role info:', { userRole, isAdmin, isCustomer })

    // Redirect logged-in users from root to their appropriate dashboard
    if (pathname === '/') {
      console.log('Redirecting authenticated user from root')
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
        console.log('Non-admin accessing dashboard, redirecting to catalog')
        const url = request.nextUrl.clone()
        url.pathname = '/catalog'
        return NextResponse.redirect(url)
      }
    }

    // Customer access control
    if (pathname.startsWith('/catalog')) {
      if (isAdmin) {
        console.log('Admin accessing catalog, redirecting to dashboard')
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/order'
        return NextResponse.redirect(url)
      }
    }

    // If logged in user tries to access login page, redirect based on role
    if (pathname === '/login' || pathname === '/signup') {
      console.log('Authenticated user accessing login/signup, redirecting based on role')
      const url = request.nextUrl.clone()
      url.pathname = isAdmin ? '/dashboard/order' : '/catalog'
      return NextResponse.redirect(url)
    }
  } else {
    console.log('No user detected for public route:', pathname)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|ico)$).*)',
  ],
}