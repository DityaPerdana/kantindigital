// Cookie debugging utility for production issues
export function debugCookies() {
  if (typeof window === 'undefined') return

  console.log('=== COOKIE DEBUG ===')
  console.log('Domain:', window.location.hostname)
  console.log('Protocol:', window.location.protocol)
  console.log('All cookies:', document.cookie)
  
  // Check for Supabase auth tokens specifically
  const authCookies = document.cookie
    .split('; ')
    .filter(cookie => cookie.includes('sb-') && cookie.includes('auth-token'))
  
  console.log('Auth cookies found:', authCookies.length)
  authCookies.forEach((cookie, index) => {
    console.log(`Auth cookie ${index + 1}:`, cookie.substring(0, 50) + '...')
  })
}

export function clearSupabaseCookies() {
  if (typeof window === 'undefined') return
  
  // Get all cookies that start with 'sb-'
  const supabaseCookies = document.cookie
    .split('; ')
    .filter(cookie => cookie.startsWith('sb-'))
    .map(cookie => cookie.split('=')[0])
  
  // Clear each Supabase cookie
  supabaseCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    // Also try clearing with domain variations
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
  })
  
  console.log('Cleared Supabase cookies:', supabaseCookies)
}

export function getCookieDomainIssues() {
  if (typeof window === 'undefined') return []
  
  const issues = []
  const hostname = window.location.hostname
  
  // Check if we're on a subdomain that might cause issues
  if (hostname.includes('vercel.app') && hostname.split('.').length > 2) {
    issues.push('Subdomain detected - cookie domain issues possible')
  }
  
  // Check if we're on localhost with port
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    issues.push('Localhost detected - ensure cookie domain is not set')
  }
  
  // Check protocol
  if (window.location.protocol === 'http:' && hostname !== 'localhost') {
    issues.push('HTTP on non-localhost - secure cookies will fail')
  }
  
  return issues
}
