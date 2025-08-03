"use client"

import { CartDrawer } from "@/components/catalog/cartDrawer"
import { CategoryTabs } from "@/components/catalog/categoryTabs"
import { ProductGrid } from "@/components/catalog/productGrid"
import { SearchAndFilters } from "@/components/catalog/searchFilters"
import LogoutButton from "@/components/landingPage/LogoutButton"
import { Badge } from "@/components/ui/badge"
import { CartProvider } from '@/utils/cartContext'

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

interface CatalogPageClientProps {
  filteredItems: FoodItem[]
  categories: string[]
  currentCategory: string
  currentSearch: string
  currentSort: string
}

export function CatalogPageClient({
  filteredItems,
  categories,
  currentCategory,
  currentSearch,
  currentSort
}: CatalogPageClientProps) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">FoodMart</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex text-black">
                {filteredItems.length} Menu Tersedia
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <CartDrawer />
              <div className="bg-pink-700 rounded-4xl">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Katalog Makanan & Minuman Terlengkap</h2>
            <p className="text-lg opacity-90 mb-6">
              Temukan berbagai pilihan makanan dan minuman berkualitas dengan harga terjangkau
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <SearchAndFilters currentSearch={currentSearch} currentSort={currentSort} />
          <CategoryTabs categories={categories} currentCategory={currentCategory} />
          <ProductGrid items={filteredItems} />
        </div>
      </div>
      </div>
    </CartProvider>
  )
}