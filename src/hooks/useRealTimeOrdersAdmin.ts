'use client'

import { browserNotificationService } from '@/utils/pushNotification'
import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client'

export function useRealtimeOrdersAdmin(initialOrders: any[]) {
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const supabase = createClient()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Subscribe to new orders
    const orderSubscription = supabase
      .channel('orders_admin')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('New order received (admin):', payload)
          
          // Fetch the complete order data with relations
          const { data: newOrderData } = await supabase
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
            .eq('orderid', payload.new.orderid)
            .single()

          if (newOrderData) {
            setOrders(prevOrders => [newOrderData, ...prevOrders])
            
            // Show notification for admin about new order
            try {
              const customerName = Array.isArray(newOrderData.users) 
                ? newOrderData.users[0]?.username 
                : (newOrderData.users as any)?.username
              
              const totalAmount = newOrderData.total_amount
              const orderNumber = newOrderData.orderid
              
              await browserNotificationService.showNotification({
                title: '🔔 Pesanan Baru!',
                body: `Pesanan #${orderNumber} dari ${customerName || 'Customer'} - Rp ${totalAmount?.toLocaleString('id-ID') || '0'}`,
                tag: `new-order-${orderNumber}`,
                icon: '/icon-192x192.png',
                requireInteraction: true
              })
            } catch (error) {
              console.error('Error showing new order notification:', error)
            }
          }
        }
      )
      .subscribe()

    // Subscribe to order status updates
    const statusSubscription = supabase
      .channel('order_status_updates_admin')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('Order status updated (admin):', payload)
          
          // Fetch the updated order data with relations
          const { data: updatedOrderData } = await supabase
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
            .eq('orderid', payload.new.orderid)
            .single()

          if (updatedOrderData) {
            setOrders(prevOrders =>
              prevOrders.map(order =>
                order.orderid === updatedOrderData.orderid ? updatedOrderData : order
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      orderSubscription.unsubscribe()
      statusSubscription.unsubscribe()
    }
  }, [supabase])

  return orders
}
