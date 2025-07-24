import { createClient } from '@/utils/supabase/server'

export async function getUserRole() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error) return null

  return userData.role
}

export async function isAdmin() {
  const role = await getUserRole()
  return role === 1
}

export async function redirectBasedOnRole() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return '/login'
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role_id')
    .eq('userid', user.id)
    .single()

  if (userError || !userData) {
    console.error('Error fetching user role:', userError)
    return '/catalog' // default fallback
  }

  if (userData.role_id === 2) {
    return '/dashboard'
  } else {
    return '/catalog'
  }
}