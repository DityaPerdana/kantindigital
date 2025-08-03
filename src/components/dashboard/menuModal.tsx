"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus, Upload, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState<MenuFormData>({
    menuname: menuItem?.name || '',
    stok: menuItem?.stock || 0,
    price: menuItem?.price?.replace(/[^\d]/g, '') || '',
    category_id: menuItem?.category?.toString() || '',
    image_url: menuItem?.image || ''
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }))
      } else {
        throw new Error('Invalid response from upload service')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-3">
            <Label>Image</Label>
            
            {formData.image_url && (
              <div className="relative inline-block">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <Image
                    src={formData.image_url}
                    alt="Menu item preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Or enter image URL below. Max file size: 5MB
              </p>
            </div>

            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="Enter image URL or upload file above"
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
            <Button type="submit" disabled={loading || uploading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Item' : 'Update Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}