import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { OrdersTable } from '@/components/dashboard/oderTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSalesData } from '@/utils/server/getSalesData'
import { OrdersTable } from '@/components/dashboard/oderTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()

  // Get sales data for the chart
  const salesData = await getSalesData()

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      orderid,
      message,
      orderedat,
      user_id,
      status_id,
      total_amount,
      order_items (
        id,
        menu_id,
        quantity,
        price,
        subtotal,
        menu:menu_id (
          menuid,
          menuname,
          price,
          stok,
          category_id,
          image_url
        )
      ),
      users:user_id (
        userid,
        username,
        email
      ),
      status:status_id (
        statusid,
        statusname
      )
    `)
    .order('orderedat', { ascending: false })

  const { data: statuses, error: statusesError } = await supabase
    .from('status')
    .select('*')
    .order('statusid')

  if (ordersError || statusesError) {
    console.error('Error fetching data:', ordersError || statusesError)
    return <div>Error loading data</div>
  }

  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter(o => o.status_id === 1).length || 0
  const successfulOrders = orders?.filter(o => o.status_id === 2).length || 0
  const totalRevenue = orders
    ?.filter(o => o.status_id === 2)
    .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  const normalizedOrders = (orders || []).map((order: any) => ({
    ...order,
    user: order.users || {
      userid: order.user_id,
      username: 'Unknown',
      email: 'No email',
      role_id: 0
    },
    order_items: order.order_items?.map((item: any) => ({
      ...item,
      menu: item.menu ? {
        menuid: item.menu.menuid,
        menuname: item.menu.menuname,
        price: item.menu.price || 0,
        stok: item.menu.stok || 0,
        category_id: item.menu.category_id || 0,
        image_url: item.menu.image_url || ''
      } : undefined
    }))
  }));

  return (
<<<<<<< HEAD
    <div className="space-y-6 p-6 ml-4">
=======
    <div className="space-y-6">
>>>>>>> c887188 (fix: cookie issue)
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-muted-foreground">
          Manage and track all customer orders
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successfulOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
          <ChartAreaInteractive salesData={salesData} />
=======
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Sales chart temporarily disabled
          </div>
>>>>>>> c887188 (fix: cookie issue)
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable 
            initialOrders={normalizedOrders} 
            statuses={statuses || []} 
          />
        </CardContent>
      </Card>
    </div>
  )
}