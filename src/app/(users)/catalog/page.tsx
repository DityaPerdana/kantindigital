import { createClient } from "@/utils/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchAndFilters } from "@/components/catalog/searchFilters"
import { CategoryTabs } from "@/components/catalog/categoryTabs"
import { ProductGrid } from "@/components/catalog/productGrid"

interface PageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
  }
}

// Fungsi untuk memfilter dan mengurutkan data
function getFilteredItems(items: any[], categoryName = "Semua", search = "", sort = "menuname") {
  return items
    .filter(
      (item) =>
        (categoryName === "Semua" || item.category.categoryname === categoryName) && 
        item.menuname.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sort) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "stock":
          return b.stok - a.stok
        default:
          return a.menuname.localeCompare(b.menuname)
      }
    })
}

export default async function FoodCatalog({ searchParams }: PageProps) {
  const { category = "Semua", search = "", sort = "menuname" } = searchParams
  
  const supabase = await createClient()
  
  // Fetch menu items with category information
  const { data: menuItems, error: menuError } = await supabase
    .from('menu')
    .select(`
      *,
      category:category_id (
        categoryid,
        categoryname
      )
    `)
  
  // Fetch all categories for tabs
  const { data: categories, error: categoriesError } = await supabase
    .from('category')
    .select('*')
    .order('categoryname')
  
  if (menuError || categoriesError) {
    console.error('Error fetching data:', menuError || categoriesError)
    return <div>Error loading data</div>
  }

  const categoryNames = ["Semua", ...(categories?.map(cat => cat.categoryname) || [])]
  const filteredItems = getFilteredItems(menuItems || [], category, search, sort)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">FoodMart</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {filteredItems.length} Menu Tersedia
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Keranjang
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Katalog Makanan & Minuman Terlengkap</h2>
            <p className="text-lg opacity-90 mb-6">
              Temukan berbagai pilihan makanan dan minuman berkualitas dengan harga terjangkau
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters currentSearch={search} currentSort={sort} />

        {/* Category Tabs */}
        <CategoryTabs categories={categoryNames} currentCategory={category} />

        {/* Product Grid */}
        <ProductGrid items={filteredItems} />
      </div>
    </div>
  )
}