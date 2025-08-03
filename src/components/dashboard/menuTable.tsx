import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/utils/supabase/server"
import { MenuActions } from "./menuAction"
import { MenuModal } from "./menuModal"

interface Menu {
  menuid: number;
  menuname: string;
  stok: number;
  price: string;
  category_id: number;
  image_url: string;
}

export default async function MenuTable() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('menu')
    .select()

  if (error) {
    return <h1>Error fetch menu data</h1>
  }

  const { data: categoriesData, error: categoriesError } = await supabase
    .from('category')
    .select('categoryid, categoryname')

  if (categoriesError) {
    return <h1>Error fetch categories data</h1>
  }

  const categories = categoriesData?.map(cat => ({
    id: cat.categoryid,
    name: cat.categoryname
  })) || []

  const menu = data.map((product) => ({
    id: product.menuid,
    name: product.menuname,
    stock: product.stok,
    price: `Rp ${product.price.toLocaleString('id-ID')}`,
    category: product.category_id,
    image: product.image_url,
  }));

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items and inventory</p>
        </div>
        <MenuModal
          mode="create"
          categories={categories}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu ID</TableHead>
              <TableHead>Menu Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-20">Image</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menu.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">{item.id}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-semibold text-green-600">{item.price}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-black">
                    {categories.find(cat => cat.id === item.category)?.name || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-semibold ${
                      item.stock === 0 
                        ? "text-red-600" 
                        : item.stock < 10 
                        ? "text-orange-600" 
                        : "text-green-600"
                    }`}
                  >
                    {item.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md">
                    <img 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.name} 
                      className="object-cover" 
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <MenuActions
                    menuItem={item}
                    categories={categories}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}