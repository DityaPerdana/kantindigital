"use client"

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
    <div className="min-h-screen bg-gray-50">
      <div>Test Catalog Component</div>
    </div>
  )
}
