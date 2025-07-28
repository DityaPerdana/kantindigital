import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { OrderForm } from "@/components/catalog/orderForm"

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

    // Ensure category data exists
    if (!menuItem.category) {
      console.error("Menu item missing category data")
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="md:flex">
              {/* Image Section */}
              <div className="md:w-1/2">
                <div className="relative">
                  <Image
                    src={menuItem.image_url || "/placeholder.svg"}
                    alt={menuItem.menuname}
                    width={600}
                    height={400}
                    className="w-full h-96 object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Details Section */}
              <div className="md:w-1/2 p-8">
                <div className="mb-4">
                  <Badge variant="outline" className="mb-2">
                    {menuItem.category.categoryname}
                  </Badge>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {menuItem.menuname}
                  </h1>
                  
                  <p className="text-2xl font-bold text-green-600 mb-4">
                    {formatPrice(menuItem.price)}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <Badge
                      variant={
                        menuItem.stok > 10 
                          ? "default" 
                          : menuItem.stok > 5 
                          ? "secondary" 
                          : menuItem.stok > 0
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {menuItem.stok > 0 ? `Stok: ${menuItem.stok}` : "Habis"}
                    </Badge>
                  </div>
                </div>

                {/* Order Form */}
                <OrderForm menuItem={menuItem} />
              </div>
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