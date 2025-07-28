"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

interface MenuItem {
  menuid: number
  menuname: string
  price: number
  stok: number
}

interface OrderFormProps {
  menuItem: MenuItem
}

export function OrderForm({ menuItem }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("User auth error:", userError)
        alert("Terjadi kesalahan saat mengambil data user")
        return
      }
      
      if (!user) {
        alert("Anda harus login terlebih dahulu")
        router.push("/login") // Redirect to login page
        return
      }

      // Validate quantity
      if (quantity < 1 || quantity > menuItem.stok) {
        alert(`Jumlah harus antara 1 dan ${menuItem.stok}`)
        return
      }

      // Create order with proper field mapping based on your schema
      // Note: Don't include orderid - let the database auto-generate it
      const orderData = {
        quantity: quantity,
        message: message || null, // Use null instead of empty string
        menu_id: menuItem.menuid,
        user_id: user.id,
        status_id: 1, // Assuming 1 is pending status
        orderedat: new Date().toISOString()
      }

      console.log("Attempting to create order with data:", orderData)

      const { data, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select() // Add select to get the created record back

      if (orderError) {
        console.error("Order creation error:", orderError)
        
        // Handle specific error cases
        if (orderError.code === '23503') {
          alert("Data referensi tidak valid. Pastikan menu dan status tersedia.")
        } else if (orderError.code === '23505') {
          alert("Pesanan duplikat terdeteksi.")
        } else {
          alert(`Terjadi kesalahan: ${orderError.message}`)
        }
        return
      }

      console.log("Order created successfully:", data)
      alert("Pesanan berhasil dibuat!")
      
      // Reset form
      setQuantity(1)
      setMessage("")
      
      // Redirect to orders page or catalog
      router.push("/orders") // or "/catalog" depending on your preference
      
    } catch (error) {
      console.error("Unexpected error creating order:", error)
      alert("Terjadi kesalahan yang tidak terduga saat membuat pesanan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    const clampedValue = Math.max(1, Math.min(value, menuItem.stok))
    setQuantity(clampedValue)
  }

  const totalPrice = menuItem.price * quantity

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesan Menu Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={menuItem.stok}
              value={quantity}
              onChange={handleQuantityChange}
              required
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Stok tersedia: {menuItem.stok}
            </p>
          </div>
          
          <div>
            <Label htmlFor="message">Pesan Tambahan (Opsional)</Label>
            <Textarea
              id="message"
              placeholder="Contoh: Pedas level 3, tanpa bawang..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isLoading}
              maxLength={500} // Add reasonable limit
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center font-semibold">
              <span>Total:</span>
              <span className="text-lg text-green-600">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || menuItem.stok === 0 || quantity < 1}
          >
            {isLoading ? "Memproses..." : menuItem.stok === 0 ? "Stok Habis" : "Pesan Sekarang"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}