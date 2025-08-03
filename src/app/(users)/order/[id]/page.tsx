import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { ArrowLeft, Calendar, Clock, CreditCard, MapPin, Phone, User } from "lucide-react"
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

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  try {
    // Get order details with status and user info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        status:status_id (
          statusid,
          statusname
        ),
        user:user_id (
          userid,
          username,
          email
        )
      `)
      .eq('orderid', resolvedParams.id)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order:", orderError)
      notFound()
    }

    // Get order items with menu details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        menu:menu_id (
          menuid,
          menuname,
          image_url,
          category:category_id (
            categoryname
          )
        )
      `)
      .eq('order_id', order.orderid)

    if (itemsError) {
      console.error("Error fetching order items:", itemsError)
      notFound()
    }

    // Check if current user can view this order
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser || (currentUser.id !== order.user_id && currentUser.user_metadata.role !== 'admin')) {
      notFound()
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
        {/* Navigation Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Link 
                href="/orders" 
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Riwayat Pesanan</span>
              </Link>
              <span className="text-gray-300">/</span>
              <Link 
                href="/catalog" 
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors ml-4"
              >
                <span className="font-medium">Kembali ke Menu</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Order Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Pesanan #{order.orderid}
                </h1>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateTime(order.orderedat)}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  className={`px-4 py-2 text-sm font-medium border ${getStatusColor(order.status?.statusname || '')}`}
                >
                  {order.status?.statusname || 'Unknown'}
                </Badge>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <CreditCard className="w-5 h-5" />
                    Item Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderItems?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.menu?.image_url || '/placeholder-food.jpg'}
                          alt={item.menu?.menuname || 'Menu Item'}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800">
                          {item.menu?.menuname || 'Unknown Item'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {item.menu?.category?.categoryname || 'Uncategorized'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-800">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Info */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card className="bg-white border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <User className="w-5 h-5" />
                    Info Pelanggan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{order.user?.username || 'Unknown User'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{order.user?.email || 'No email'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Timeline */}
              <Card className="bg-white border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Clock className="w-5 h-5" />
                    Status Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Pesanan Diterima - Always shown */}
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-emerald-700">Pesanan Diterima</p>
                        <p className="text-sm text-gray-500">{formatDateTime(order.orderedat)}</p>
                      </div>
                    </div>
                    
                    {/* Sedang Diproses - Show if not pending and not rejected/cancelled */}
                    {!['pending', 'menunggu', 'rejected', 'ditolak', 'cancelled', 'dibatalkan'].includes(order.status?.statusname?.toLowerCase() || '') && (
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          ['processing', 'diproses', 'ready', 'siap', 'completed', 'selesai', 'success', 'sukses'].includes(order.status?.statusname?.toLowerCase() || '') 
                            ? 'bg-emerald-500' 
                            : 'bg-gray-300'
                        }`}></div>
                        <div>
                          <p className={`font-medium ${
                            ['processing', 'diproses', 'ready', 'siap', 'completed', 'selesai', 'success', 'sukses'].includes(order.status?.statusname?.toLowerCase() || '') 
                              ? 'text-emerald-700' 
                              : 'text-gray-500'
                          }`}>
                            {['processing', 'diproses'].includes(order.status?.statusname?.toLowerCase() || '') 
                              ? 'Sedang Diproses' 
                              : 'Diproses'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {['processing', 'diproses'].includes(order.status?.statusname?.toLowerCase() || '') 
                              ? 'Estimasi 15-20 menit'
                              : 'Pesanan telah diproses'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Siap Diambil / Selesai - Show if ready, completed, or success */}
                    {['ready', 'siap', 'completed', 'selesai', 'success', 'sukses'].includes(order.status?.statusname?.toLowerCase() || '') && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-emerald-700">
                            {['completed', 'selesai', 'success', 'sukses'].includes(order.status?.statusname?.toLowerCase() || '') 
                              ? 'Pesanan Selesai' 
                              : 'Siap Diambil'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {['completed', 'selesai', 'success', 'sukses'].includes(order.status?.statusname?.toLowerCase() || '') 
                              ? 'Pesanan telah selesai' 
                              : 'Pesanan sudah siap'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Cancelled/Rejected - Show if cancelled or rejected */}
                    {['cancelled', 'dibatalkan', 'rejected', 'ditolak'].includes(order.status?.statusname?.toLowerCase() || '') && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-red-700">
                            {['rejected', 'ditolak'].includes(order.status?.statusname?.toLowerCase() || '') 
                              ? 'Pesanan Ditolak' 
                              : 'Pesanan Dibatalkan'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {['rejected', 'ditolak'].includes(order.status?.statusname?.toLowerCase() || '') 
                              ? 'Pesanan telah ditolak oleh penjual' 
                              : 'Pesanan telah dibatalkan'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              {order.message && (
                <Card className="bg-white border border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <MapPin className="w-5 h-5" />
                      Catatan Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{order.message}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in order detail page:", error)
    notFound()
  }
}
