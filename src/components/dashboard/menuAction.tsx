"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { MenuModal } from "./menuModal"
import { useRouter } from "next/navigation"

interface MenuActionsProps {
  menuItem: {
    id: number
    name: string
    stock: number
    price: string
    category: number
    image: string
  }
  categories: { id: number; name: string }[]
}

export function MenuActions({ menuItem, categories }: MenuActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${menuItem.name}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/menu/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: menuItem.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete menu item')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Failed to delete menu item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <MenuModal
        mode="edit"
        menuItem={menuItem}
        categories={categories}
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
