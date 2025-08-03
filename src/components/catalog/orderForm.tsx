"use client"

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { clearSupabaseCookies, debugCookies } from "@/utils/cookieDebug"
import { createClient } from "@/utils/supabase/client"
import { MessageSquare, Minus, Package, Plus, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Show confirmation dialog instead of directly processing the order
    setShowConfirmDialog(true)
  }

  const handleConfirmOrder = async () => {
    setShowConfirmDialog(false)
    setIsLoading(true)

    try {
      // Debug cookies before making request
      debugCookies()
      
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("User auth error:", userError)
        
        // If it's a cookie-related auth error, try to clear and redirect
        if (userError.message.includes('session') || userError.message.includes('token')) {
          console.log("Clearing cookies due to auth error")
          clearSupabaseCookies()
          alert("Sesi Anda telah berakhir. Silakan login kembali.")
          router.push("/login")
          return
        }
        
        alert("Terjadi kesalahan saat mengambil data user")
        return
      }
      
      if (!user) {
        console.log("No user found, redirecting to login")
        clearSupabaseCookies()
        alert("Anda harus login terlebih dahulu")
        router.push("/login")
        return
      }

      if (quantity < 1 || quantity > menuItem.stok) {
        alert(`Jumlah harus antara 1 dan ${menuItem.stok}`)
        return
      }

      const totalAmount = menuItem.price * quantity

      // First, create the order
      const orderData = {
        message: message || null,
        user_id: user.id,
        status_id: 1,
        total_amount: totalAmount
      }

      console.log("Attempting to create order with data:", orderData)

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        console.error("Order creation error:", orderError)
        
        if (orderError.code === '23503') {
          alert("Data referensi tidak valid. Pastikan menu dan status tersedia.")
        } else if (orderError.code === '23505') {
          alert("Pesanan duplikat terdeteksi.")
        } else {
          alert(`Terjadi kesalahan: ${orderError.message}`)
        }
        return
      }

      // Then, create the order item
      const orderItemData = {
        order_id: orderResult.orderid,
        menu_id: menuItem.menuid,
        quantity: quantity,
        price: menuItem.price,
        subtotal: totalAmount
      }

      console.log("Attempting to create order item with data:", orderItemData)

      const { data: orderItemResult, error: orderItemError } = await supabase
        .from('order_items')
        .insert(orderItemData)
        .select()

      if (orderItemError) {
        console.error("Order item creation error:", orderItemError)
        
        // If order item creation fails, we should delete the order
        await supabase.from('orders').delete().eq('orderid', orderResult.orderid)
        
        alert(`Terjadi kesalahan saat membuat item pesanan: ${orderItemError.message}`)
        return
      }

      console.log("Order created successfully:", orderResult)
      console.log("Order item created successfully:", orderItemResult)
      alert("Pesanan berhasil dibuat!")
      
      setQuantity(1)
      setMessage("")
            
    } catch (error) {
      console.error("Unexpected error creating order:", error)
      alert("Terjadi kesalahan yang tidak terduga saat membuat pesanan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = () => {
    setShowConfirmDialog(false)
  }

  const handleQuantityChange = (newQuantity: number) => {
    const clampedValue = Math.max(1, Math.min(newQuantity, menuItem.stok))
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

  const isOutOfStock = menuItem.stok === 0

  return (
    <>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Pesan Menu Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="quantity" className="text-base font-bold text-gray-800 flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-3 h-3 text-blue-600" />
              </div>
              Jumlah Pesanan
            </Label>
            
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-4 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  className="h-12 w-12 rounded-xl border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isLoading}
                >
                  <Minus className="w-5 h-5 text-emerald-700" />
                </button>
              
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white rounded-lg border-2 border-emerald-300 focus-within:border-emerald-500 shadow-sm text-black">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={menuItem.stok}
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    const parsed = parseInt(value, 10);
                    if (!isNaN(parsed)) {
                      handleQuantityChange(parsed);
                    } else if (value === "") {
                      setQuantity(1);
                    }
                  }}
                  className="text-center text-2xl font-bold h-16 w-20 border-0 focus:ring-0 focus:outline-none bg-transparent"
                  disabled={isLoading}
                />
                </div>
                <span className="text-xs text-emerald-700 font-medium">porsi</span>
              </div>
              
              <button
                type="button"
                className="h-12 w-12 rounded-xl border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= menuItem.stok || isLoading}
              >
                <Plus className="w-5 h-5 text-emerald-700" />
              </button>
              </div>
              
              <div className="mt-4 pt-3 border-t border-emerald-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                <div className="w-2 h-2 rounded-full" style={{
                  background:
                  menuItem.stok > 10
                    ? "#22c55e"
                    : menuItem.stok > 5
                    ? "#facc15"
                    : "#ef4444"
                }}></div>
                <span>
                  {menuItem.stok > 10
                  ? "Stok tersedia"
                  : menuItem.stok > 5
                  ? "Stok menipis"
                  : "Stok hampir habis"}
                </span>
                </div>
                <span className="text-sm font-bold text-emerald-900">{menuItem.stok} porsi</span>
              </div>
              
              <div className="mt-2 w-full bg-emerald-100 rounded-full h-2">
                <div 
                className={`h-2 rounded-full transition-all duration-300`}
                style={{
                  width: `${Math.min((menuItem.stok / 20) * 100, 100)}%`,
                  background:
                  menuItem.stok > 10
                    ? "linear-gradient(90deg, #22c55e 60%, #4ade80 100%)"
                    : menuItem.stok > 5
                    ? "linear-gradient(90deg, #facc15 60%, #fde68a 100%)"
                    : "linear-gradient(90deg, #ef4444 60%, #fca5a5 100%)"
                }}
                ></div>
              </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="message" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Pesan Tambahan <span className="text-gray-400 font-normal">(Opsional)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Contoh: Pedas level 3, tanpa bawang, extra sambal..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isLoading}
              maxLength={500}
              className="resize-none border-2 focus:border-green-500 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 text-right">
              {message.length}/500 karakter
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                <p className="text-xs text-gray-500">{quantity} x {formatPrice(menuItem.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatPrice(totalPrice)}
                </p>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full h-14 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              isOutOfStock 
                ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" 
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-white"
            }`}
            disabled={isLoading || isOutOfStock || quantity < 1}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses Pesanan...
              </>
            ) : isOutOfStock ? (
              <>
                <Package className="w-5 h-5" />
                Stok Habis
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Pesan Sekarang
              </>
            )}
          </button>

          {!isOutOfStock && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                💳 Pembayaran dilakukan setelah pesanan dikonfirmasi
              </p>
              <p className="text-xs text-gray-400">
                ⏱️ Estimasi waktu pembuatan: 15-20 menit
              </p>
            </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog - Moved outside Card to avoid DOM nesting issues */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Konfirmasi Pesanan
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="text-left">
                <p className="font-medium text-gray-900 mb-2">Detail Pesanan:</p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <p className="text-sm"><span className="font-medium">Menu:</span> {menuItem.menuname}</p>
                  <p className="text-sm"><span className="font-medium">Jumlah:</span> {quantity} porsi</p>
                  <p className="text-sm"><span className="font-medium">Harga satuan:</span> {formatPrice(menuItem.price)}</p>
                  {message && (
                    <p className="text-sm"><span className="font-medium">Pesan tambahan:</span> {message}</p>
                  )}
                  <hr className="my-2" />
                  <p className="text-sm font-bold text-green-600">
                    <span className="font-medium text-gray-900">Total:</span> {formatPrice(totalPrice)}
                  </p>
                </div>
              </div>
              <p className="text-center text-gray-600">
                Apakah Anda yakin ingin melanjutkan pesanan ini?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <button 
              onClick={handleCancelOrder}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Batal
            </button>
            <button 
              onClick={handleConfirmOrder}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ya, Pesan Sekarang"
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}