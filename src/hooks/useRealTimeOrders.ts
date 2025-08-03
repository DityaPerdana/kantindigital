'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client'

export function useRealtimeOrders(initialOrders: any[]) {
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new orders
    const orderSubscription = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('New order received:', payload)
          
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
          }
        }
      )
      .subscribe()

    // Subscribe to order status updates
    const statusSubscription = supabase
      .channel('order_status_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('Order status updated:', payload)
          
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