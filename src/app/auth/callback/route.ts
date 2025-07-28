import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role_id')
          .eq('userid', user.id)
          .single()

        const userRole = userData?.role_id
        const redirectPath = userRole === 2 ? '/dashboard/order' : '/catalog'
        
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
      
      return NextResponse.redirect(`${origin}/catalog`)
    }
  }

  return NextResponse.redirect(`${origin}/error`)
}