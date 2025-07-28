"use client";

import { createClient } from "./supabase/client"
import { useRouter } from "next/navigation"

const handleLogout = async () => {
    const supabase  =  await createClient()
    const router = useRouter()
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        alert('Failed to logout. Please try again.')
        return
      }
      
      // Redirect to login page
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      alert('Failed to logout. Please try again.')
    }
  }

export default handleLogout