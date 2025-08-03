"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/utils/cartContext"
import { createClient } from "@/utils/supabase/client"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function CartDrawer() {
  const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    
    setIsProcessing(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Please login to checkout")
        router.push("/login")
        return
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status_id: 1,
          total_amount: getTotalPrice(),
<<<<<<< HEAD
          orderedat: new Date().toISOString(),
=======
>>>>>>> c887188 (fix: cookie issue)
          message: null
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.orderid,
        menu_id: item.menuid,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear the cart
      await clearCart()
      
      alert("Order placed successfully!")
      setIsOpen(false)
<<<<<<< HEAD
=======
      // router.push('/orders') // Redirect to orders page
>>>>>>> c887188 (fix: cookie issue)
      
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
<<<<<<< HEAD
        <Button variant="outline" size="icon" className="relative bg-[#FFF07C]">
          <ShoppingCart className="h-5 w-5 text-black" />
=======
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
>>>>>>> c887188 (fix: cookie issue)
          {getTotalItems() > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
<<<<<<< HEAD
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-6 w-6 text-black" />
=======
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
>>>>>>> c887188 (fix: cookie issue)
            Keranjang Belanja
          </SheetTitle>
        </SheetHeader>
        
<<<<<<< HEAD
        <div className="mt-6 flex-1 overflow-y-auto px-2">
=======
        <div className="mt-8 flex-1 overflow-y-auto">
>>>>>>> c887188 (fix: cookie issue)
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p>Keranjang belanja kosong</p>
            </div>
          ) : (
<<<<<<< HEAD
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.menuid} className="flex gap-6 p-6 bg-gray-50 rounded-lg">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
=======
            <div className="space-y-4 text-black">
              {cartItems.map((item) => (
                <div key={item.menuid} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
>>>>>>> c887188 (fix: cookie issue)
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.menuname}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
<<<<<<< HEAD
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base text-black truncate">{item.menuname}</h4>
                    <p className="text-sm text-gray-500 mt-1">{formatPrice(item.price)}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 text-black hover:text-black border border-gray-300"
                          onClick={() => updateQuantity(item.menuid, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-10 text-center text-base font-medium text-black">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 text-black hover:text-black border border-gray-300"
                          onClick={() => updateQuantity(item.menuid, Math.min(item.quantity + 1, item.stok))}
                          disabled={item.quantity >= item.stok}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between items-end flex-shrink-0">
                    <p className="font-semibold text-base text-black">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors mt-2"
                      onClick={() => removeFromCart(item.menuid)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
=======
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.menuname}</h4>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.menuid, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.menuid, Math.min(item.quantity + 1, item.stok))}
                        disabled={item.quantity >= item.stok}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-auto text-red-500 hover:text-white hover:bg-pink-700"
                        onClick={() => removeFromCart(item.menuid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
>>>>>>> c887188 (fix: cookie issue)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
<<<<<<< HEAD
          <div className="border-t pt-6 mt-6 space-y-6 px-2">
            <div className="flex justify-between text-xl font-semibold">
              <span>Total</span>
              <span className="text-black">{formatPrice(getTotalPrice())}</span>
            </div>
            
            <Button 
              className="w-full text-base py-6" 
=======
          <div className="border-t pt-4 mt-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            
            <Button 
              className="w-full" 
>>>>>>> c887188 (fix: cookie issue)
              size="lg"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Checkout"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}