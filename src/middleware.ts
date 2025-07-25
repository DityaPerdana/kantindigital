import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { createClient } from './utils/supabase/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect to login if trying to access dashboard without a session
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in, check their role and apply redirects
  if (user) {
    // Fetch user role once to avoid redundant DB calls
    const { data: userData } = await supabase
      .from('users')
      .select('role_id')
      .eq('userid', user.id)
      .single()

    const isAdmin = userData?.role_id === 2

    // If a non-admin tries to access the dashboard, redirect them
    if (!isAdmin && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/catalog', request.url))
    }

    // If an admin tries to access the catalog, redirect them to the dashboard
    if (isAdmin && pathname.startsWith('/catalog')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}