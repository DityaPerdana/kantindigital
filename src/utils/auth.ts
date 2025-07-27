import { createClient } from '@/utils/supabase/server'

export async function getUserRole(): Promise<number | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role_id')
    .eq('userid', user.id) 
    .single()

  return userData?.role_id ?? null
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 2
}