import { OrderDetailClient } from "@/components/order/order-detail-client"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    id: string
  }>
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

    return <OrderDetailClient initialOrder={order} orderItems={orderItems || []} />
  } catch (error) {
    console.error("Unexpected error in order detail page:", error)
    notFound()
  }
}
