import { CatalogPageClient } from "@/components/catalog/catalogPageClient"
import { createClient } from "@/utils/supabase/server"

interface PageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
  }>
}

function getFilteredItems(items: any[], categoryName = "Semua", search = "", sort = "menuname") {
  return items
    .filter(
      (item) =>
        (categoryName === "Semua" || item.category?.categoryname === categoryName) &&
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
    <CatalogPageClient
      filteredItems={filteredItems}
      categories={categoryNames}
      currentCategory={category}
      currentSearch={search}
      currentSort={sort}
    />
  )
}