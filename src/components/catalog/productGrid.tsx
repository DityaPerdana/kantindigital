"use client"

import Image from "next/image"
import Link from "next/link"
import { Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

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
  }
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
        <Link key={item.menuid} href={`/catalog/${item.menuid}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-amber-50">
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
                  className="absolute top-2 right-2"
                >
                  Stok: {item.stok}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-2">
                <Badge variant="outline" className="text-xs bg-amber-200 text-black">
                  {item.category.categoryname}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-black">{item.menuname}</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-black">{formatPrice(item.price)}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}