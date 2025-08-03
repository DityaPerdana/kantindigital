import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Safe cookie options for server-side
              const safeOptions = {
                ...options,
                // Don't set domain to avoid invalid domain errors
                domain: undefined,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                httpOnly: false, // Auth tokens need client access
              }
              cookieStore.set(name, value, safeOptions)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}