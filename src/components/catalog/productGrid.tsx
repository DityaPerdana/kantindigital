"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCart } from "@/utils/cartContext"
import { Filter, Plus, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface FoodItem {
  menuid: number
  menuname: string
  stok: number
  price: number
  category_id: number
  image_url: string
  category: {
    categoryid: number
    categoryname: string
  } | null
}

interface ProductGridProps {
  items: FoodItem[]
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}

export function ProductGrid({ items }: ProductGridProps) {
  const { addToCart, cartItems } = useCart()
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  const handleAddToCart = async (e: React.MouseEvent, item: FoodItem) => {
    e.preventDefault() // Prevent navigation to detail page
    e.stopPropagation()
    
    setAddingToCart(item.menuid)
    
    // Check if item is in stock
    if (item.stok === 0) {
      alert("Item is out of stock")
      setAddingToCart(null)
      return
    }
    
    // Check if already in cart and if adding more would exceed stock
    const existingItem = cartItems.find(cartItem => cartItem.menuid === item.menuid)
    if (existingItem && existingItem.quantity >= item.stok) {
      alert(`Maximum stock (${item.stok}) already in cart`)
      setAddingToCart(null)
      return
    }
    
    await addToCart({
      ...item,
      quantity: 1
    })
    
    setAddingToCart(null)
  }

  const getItemQuantityInCart = (menuid: number) => {
    const item = cartItems.find(cartItem => cartItem.menuid === menuid)
    return item ? item.quantity : 0
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-black mb-4">
          <Filter className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-black mb-2">Tidak ada menu yang ditemukan</h3>
        <p className="text-black1">Coba ubah filter atau kata kunci pencarian Anda</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.menuid} className="overflow-hidden hover:shadow-lg transition-shadow bg-amber-50 relative group">
          <Link href={`/catalog/${item.menuid}`}>
            <CardHeader className="p-0">
              <div className="relative">
                <Image
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.menuname}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <Badge
                  variant={item.stok > 10 ? "default" : item.stok > 5 ? "secondary" : "destructive"}
                  className="absolute top-2 right-2 text-black"
                >
                  Stok: {item.stok}
                </Badge>
                {getItemQuantityInCart(item.menuid) > 0 && (
                  <Badge
                    variant="default"
                    className="absolute top-2 left-2 bg-green-600"
                  >
                    {getItemQuantityInCart(item.menuid)} di keranjang
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-2">
                <Badge variant="outline" className="text-xs bg-amber-200 text-black">
                  {item.category?.categoryname || 'Uncategorized'}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-black">{item.menuname}</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-black">{formatPrice(item.price)}</span>
              </div>
            </CardContent>
          </Link>
          
          {/* Add to Cart Button */}
<<<<<<< HEAD
          <div className="absolute bottom-4 right-4 transition-opacity">
=======
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
>>>>>>> c887188 (fix: cookie issue)
            <Button
              size="icon"
              variant={item.stok === 0 ? "secondary" : "default"}
              className={`
                rounded-full shadow-lg transform transition-all duration-200 
                ${item.stok === 0 ? 'cursor-not-allowed' : 'hover:scale-110'}
                ${addingToCart === item.menuid ? 'scale-95' : ''}
              `}
              onClick={(e) => handleAddToCart(e, item)}
              disabled={item.stok === 0 || addingToCart === item.menuid}
            >
              {addingToCart === item.menuid ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <Plus className="h-3 w-3 absolute -top-1 -right-1 bg-white text-primary rounded-full" />
                </>
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}