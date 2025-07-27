"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserFormData {
  username: string
  email: string
  role_id: string
}

interface UserModalProps {
  mode: 'create' | 'edit'
  userItem?: {
    userid: string
    username: string
    email: string
    role_id: number
    roles?: { rolename: string }
  }
  roles?: { roleid: number; rolename: string }[]
}

export function UserModal({ mode, userItem, roles = [] }: UserModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState<UserFormData>({
    username: userItem?.username || '',
    email: userItem?.email || '',
    role_id: userItem?.role_id?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('username', formData.username)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('role_id', formData.role_id)
      
      if (mode === 'edit' && userItem) {
        formDataToSend.append('userid', userItem.userid)
      }

      const endpoint = mode === 'create' ? '/api/user/create' : '/api/user/edit'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save user')
      }

      setOpen(false)
      router.refresh()
      
      if (mode === 'create') {
        setFormData({
          username: '',
          email: '',
          role_id: '',
        })
      }
    } catch (error: any) {
      console.error('Error submitting form:', error)
      alert(error.message || 'Failed to save user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role_id}
              onValueChange={(value) => handleInputChange('role_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.roleid} value={role.roleid.toString()}>
                    {role.rolename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Add User' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}