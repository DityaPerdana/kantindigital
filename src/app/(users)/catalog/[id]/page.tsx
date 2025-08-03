import { OrderForm } from "@/components/catalog/orderForm"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"
import { ArrowLeft, Clock, Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}

export default async function CatalogDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  try {
    const { data: menuItem, error } = await supabase
      .from('menu')
      .select(`
        *,
        category:category_id (
          categoryid,
          categoryname
        )
      `)
      .eq('menuid', resolvedParams.id)
      .single()

    if (error) {
      console.error("Error fetching menu item:", error)
      notFound()
    }

    if (!menuItem) {
      notFound()
    }

    // Note: category can be null for orphaned menu items - we'll handle this gracefully in the UI

    const getStockStatus = (stock: number) => {
      if (stock === 0) return { variant: "destructive" as const, text: "Habis", color: "bg-red-50 text-red-700" }
      if (stock <= 5) return { variant: "destructive" as const, text: `Tersisa ${stock}`, color: "bg-orange-50 text-orange-700" }
      if (stock <= 10) return { variant: "secondary" as const, text: `Stok ${stock}`, color: "bg-yellow-50 text-yellow-700" }
      return { variant: "default" as const, text: `Stok ${stock}`, color: "bg-green-50 text-green-700" }
    }

    const stockStatus = getStockStatus(menuItem.stok)

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Navigation Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Link 
                href="/catalog" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Kembali ke Menu</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="lg:flex">
              {/* Image Section */}
              <div className="lg:w-3/5 relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={menuItem.image_url || "/placeholder.svg"}
                    alt={menuItem.menuname}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  
                  {/* Category badge overlay */}
                  <div className="absolute top-6 left-6">
                    <Badge 
                      variant="secondary" 
                      className="bg-white/90 text-gray-700 backdrop-blur-sm px-4 py-2 text-sm font-medium shadow-lg"
                    >
                      {menuItem.category?.categoryname || 'Uncategorized'}
                    </Badge>
                  </div>

                  {/* Stock status overlay */}
                  <div className="absolute top-6 right-6">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${stockStatus.color} shadow-lg`}>
                      {stockStatus.text}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="lg:w-2/5 p-8 lg:p-12">
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                      {menuItem.menuname}
                    </h1>
                    
                    {/* Price with enhanced styling */}
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatPrice(menuItem.price)}
                      </span>
                    </div>

                    {/* Additional info badges */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">4.8</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">15-20 min</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">1-2 porsi</span>
                      </div>
                    </div>

                    {/* Description (if available) */}
                    {menuItem.description && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
                        <p className="text-gray-600 leading-relaxed">{menuItem.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Order Form */}
                  <div className="mt-auto">
                    <OrderForm menuItem={menuItem} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional sections could be added here */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Kualitas Premium</h3>
              </div>
              <p className="text-gray-600 text-sm">Dibuat dengan bahan-bahan segar dan berkualitas tinggi</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Siap Cepat</h3>
              </div>
              <p className="text-gray-600 text-sm">Pesanan Anda akan diproses dengan cepat dan efisien</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Porsi Pas</h3>
              </div>
              <p className="text-gray-600 text-sm">Porsi yang tepat untuk kebutuhan makan Anda</p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in catalog detail page:", error)
    notFound()
  }
}