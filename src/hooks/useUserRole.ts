// filepath: /home/ditya/Projects/kantindigital/src/hooks/useUserRole.ts
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'

export function useUserRole() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [roleId, setRoleId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role_id')
          .eq('userid', user.id)
          .single()
        
        setRoleId(userData?.role_id ?? null)
      }
      setLoading(false)
    }

    getUserData()
  }, [supabase])

  return { user, roleId, isAdmin: roleId === 2, loading }
}