import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/server"
import { ArrowLeft, Calendar, Eye, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Order Card Component
function OrderCard({ order, getStatusColor }: { 
  order: any, 
  getStatusColor: (statusName: string) => string 
}) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white border border-gray-100 hover:border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Pesanan #{order.orderid}
              </h3>
              <Badge 
                className={`px-3 py-1 text-xs font-medium border ${getStatusColor(order.status?.statusname || '')}`}
              >
                {order.status?.statusname || 'Unknown'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(order.orderedat)}</span>
            </div>
            
            <div className="text-xl font-bold text-emerald-600">
              {formatPrice(order.total_amount)}
            </div>
            
            {order.message && (
              <p className="text-sm text-gray-400 mt-2 italic">
                "{order.message}"
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={`/order/${order.orderid}`}>
              <Button variant="outline" className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 text-gray-700">
                <Eye className="w-4 h-4 mr-2" />
                Lihat Detail
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function OrdersPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Get user's orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      status:status_id (
        statusid,
        statusname
      )
    `)
    .eq('user_id', user.id)
    .order('orderedat', { ascending: false })

  if (ordersError) {
    console.error("Error fetching orders:", ordersError)
  }

  const getStatusColor = (statusName: string) => {
    switch (statusName?.toLowerCase()) {
      case 'pending':
      case 'menunggu':
        return "bg-amber-50 text-amber-700 border-amber-200"
      case 'processing':
      case 'diproses':
        return "bg-blue-50 text-blue-700 border-blue-200"
      case 'ready':
      case 'siap':
        return "bg-green-50 text-green-700 border-green-200"
      case 'completed':
      case 'selesai':
      case 'success':
      case 'sukses':
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case 'cancelled':
      case 'dibatalkan':
      case 'rejected':
      case 'ditolak':
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/catalog">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 bg-white">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Catalog
                </Button>
              </Link>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Pesanan</h1>
          <p className="text-gray-500">Lihat semua pesanan yang pernah Anda buat</p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="bg-white border border-gray-100">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Pesanan</h3>
              <p className="text-gray-400 text-center mb-6">
                Anda belum pernah membuat pesanan. Mulai jelajahi menu kami!
              </p>
              <Link href="/catalog">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Lihat Menu
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-300 p-1 rounded-lg shadow-sm">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md !text-black hover:!text-gray-800 hover:bg-gray-100 transition-all font-medium"
              >
                Semua
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md !text-black hover:!text-gray-800 hover:bg-gray-100 transition-all font-medium"
              >
                Menunggu
              </TabsTrigger>
              <TabsTrigger 
                value="success"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md !text-black hover:!text-gray-800 hover:bg-gray-100 transition-all font-medium"
              >
                Berhasil
              </TabsTrigger>
              <TabsTrigger 
                value="rejected"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md !text-black hover:!text-gray-800 hover:bg-gray-100 transition-all font-medium"
              >
                Ditolak
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.orderid} order={order} getStatusColor={getStatusColor} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {orders
                .filter(order => ['pending', 'menunggu'].includes(order.status?.statusname?.toLowerCase() || ''))
                .map((order) => (
                  <OrderCard key={order.orderid} order={order} getStatusColor={getStatusColor} />
                ))}
              {orders.filter(order => ['pending', 'menunggu'].includes(order.status?.statusname?.toLowerCase() || '')).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">Tidak ada pesanan pending</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="success" className="space-y-4">
              {orders
                .filter(order => ['completed', 'selesai', 'success', 'sukses', 'ready', 'siap'].includes(order.status?.statusname?.toLowerCase() || ''))
                .map((order) => (
                  <OrderCard key={order.orderid} order={order} getStatusColor={getStatusColor} />
                ))}
              {orders.filter(order => ['completed', 'selesai', 'success', 'sukses', 'ready', 'siap'].includes(order.status?.statusname?.toLowerCase() || '')).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">Tidak ada pesanan yang berhasil</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {orders
                .filter(order => ['rejected', 'ditolak', 'cancelled', 'dibatalkan'].includes(order.status?.statusname?.toLowerCase() || ''))
                .map((order) => (
                  <OrderCard key={order.orderid} order={order} getStatusColor={getStatusColor} />
                ))}
              {orders.filter(order => ['rejected', 'ditolak', 'cancelled', 'dibatalkan'].includes(order.status?.statusname?.toLowerCase() || '')).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">Tidak ada pesanan yang ditolak</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link href="/catalog">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Pesan Lagi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
