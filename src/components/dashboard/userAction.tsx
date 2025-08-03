"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { UserModal } from "./userModal"
import { useRouter } from "next/navigation"

interface UserActionsProps {
  userItem: {
    userid: string
    username: string
    email: string
    role_id: number
    roles?: { rolename: string }
  }
  roles: { roleid: number; rolename: string }[]
}

export function UserActions({ userItem, roles }: UserActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user ${userItem.username}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid: userItem.userid }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <UserModal
        mode="edit"
        userItem={userItem}
        roles={roles}
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}