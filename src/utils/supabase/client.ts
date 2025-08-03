import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Custom cookie getter that handles invalid domain issues
          try {
            // Check if we're in the browser environment
            if (typeof document === 'undefined') {
              return undefined
            }
            return document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
          } catch (error) {
            console.warn('Error getting cookie:', name, error)
            return undefined
          }
        },
        set(name: string, value: string, options: any) {
          // Custom cookie setter with safer options
          try {
            // Check if we're in the browser environment
            if (typeof document === 'undefined') {
              return
            }
            
            const cookieOptions = {
              ...options,
              // Don't set domain explicitly in browser
              domain: undefined,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            }
            
            let cookieString = `${name}=${value}`
            
            if (cookieOptions.maxAge) cookieString += `; Max-Age=${cookieOptions.maxAge}`
            if (cookieOptions.expires) cookieString += `; Expires=${cookieOptions.expires.toUTCString()}`
            if (cookieOptions.path) cookieString += `; Path=${cookieOptions.path}`
            if (cookieOptions.secure) cookieString += `; Secure`
            if (cookieOptions.sameSite) cookieString += `; SameSite=${cookieOptions.sameSite}`
            
            document.cookie = cookieString
          } catch (error) {
            console.warn('Error setting cookie:', name, error)
          }
        },
        remove(name: string, options: any) {
          // Custom cookie remover
          try {
            this.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.warn('Error removing cookie:', name, error)
          }
        }
      }
    }
  )
}