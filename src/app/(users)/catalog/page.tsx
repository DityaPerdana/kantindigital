import { createClient } from "@/utils/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchAndFilters } from "@/components/catalog/searchFilters"
import { CategoryTabs } from "@/components/catalog/categoryTabs"
import { ProductGrid } from "@/components/catalog/productGrid"
import handleLogout from "@/utils/handleLogout"

interface PageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
  }
}

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

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const { category = "Semua", search = "", sort = "menuname" } = params || {}

  const supabase = await createClient()
  
  const { data: menuItems, error: menuError } = await supabase
    .from('menu')
    .select(`
      *,
      category:category_id (
        categoryid,
        categoryname
      )
    `)
  
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">FoodMart</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
          {filteredItems.length} Menu Tersedia
              </Badge>
            </div>
            <div className="flex items-center space-x-4 bg-pink-700 rounded-4xl">
          <Button variant="destructive" size="sm" type="submit" className="rounded-4xl" onClick={handleLogout}>
            Logout
          </Button>
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

        <SearchAndFilters currentSearch={search} currentSort={sort} />

        <CategoryTabs categories={categoryNames} currentCategory={category} />

        <ProductGrid items={filteredItems} />
      </div>
    </div>
  )
}