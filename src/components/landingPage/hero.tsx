import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { logout } from '@/utils/server/action'

export default async function LandingPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <>
      <form action={logout}>
        <button 
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </form>
      <p>Hello {data.user.email}</p>
    </>
  )
}