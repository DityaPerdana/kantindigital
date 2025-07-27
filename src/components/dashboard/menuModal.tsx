"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

interface MenuFormData {
  menuname: string
  stok: number
  price: string
  category_id: string
  image_url: string
}

interface MenuModalProps {
  mode: 'create' | 'edit'
  menuItem?: {
    id: number
    name: string
    stock: number
    price: string
    category: number
    image: string
  }
  categories?: { id: number; name: string }[]
}

export function MenuModal({ mode, menuItem, categories = [] }: MenuModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState<MenuFormData>({
    menuname: menuItem?.name || '',
    stok: menuItem?.stock || 0,
    price: menuItem?.price?.replace(/[^\d]/g, '') || '', // Remove formatting
    category_id: menuItem?.category?.toString() || '',
    image_url: menuItem?.image || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('menuname', formData.menuname)
      formDataToSend.append('stok', formData.stok.toString())
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category_id', formData.category_id)
      formDataToSend.append('image_url', formData.image_url)
      
      if (mode === 'edit' && menuItem) {
        formDataToSend.append('id', menuItem.id.toString())
      }

      const endpoint = mode === 'create' ? '/api/menu/create' : '/api/menu/update'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to save menu item')
      }

      setOpen(false)
      router.refresh()
      
      // Reset form for create mode
      if (mode === 'create') {
        setFormData({
          menuname: '',
          stok: 0,
          price: '',
          category_id: '',
          image_url: ''
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to save menu item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof MenuFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Item
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
            {mode === 'create' ? 'Create New Menu Item' : 'Edit Menu Item'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="menuname">Menu Name</Label>
            <Input
              id="menuname"
              value={formData.menuname}
              onChange={(e) => handleInputChange('menuname', e.target.value)}
              placeholder="Enter menu name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (Rp)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Enter price"
              min="0"
              max="99999.99"
              step="0.01"
              required
            />
            <p className="text-xs text-muted-foreground">Maximum: Rp 99,999.99</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok">Stock</Label>
            <Input
              id="stok"
              type="number"
              value={formData.stok}
              onChange={(e) => handleInputChange('stok', parseInt(e.target.value) || 0)}
              placeholder="Enter stock quantity"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleInputChange('category_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="Enter image URL or upload link"
            />
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Item' : 'Update Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
