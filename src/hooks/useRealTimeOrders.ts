'use client'

import { useEffect, useState } from 'react'
import { browserNotificationService } from "../utils/pushNotification"
import { createClient } from '../utils/supabase/client'

interface Order {
  orderid: number
  message: string
  orderedat: string
  user_id: string
  status_id: number
  total_amount: number
  order_items?: {
<<<<<<< HEAD
    id: number
=======
>>>>>>> c887188 (fix: cookie issue)
    menu_id: number
    quantity: number
    price: number
    subtotal: number
    menu?: {
      menuid: number
      menuname: string
      price: number
    }
  }[]
  users?: {
    userid: string
    username: string
    email: string
  }
  status?: {
    statusid: number
    statusname: string
  }
}

export function useRealtimeOrders(initialOrders: Order[]) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const supabase = createClient()

  useEffect(() => {
    setOrders(initialOrders)

    const channel = supabase
      .channel('orders-realtime-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newOrderData, error } = await supabase
              .from('orders')
              .select(`
                *,
                order_items (
<<<<<<< HEAD
                  id,
=======
>>>>>>> c887188 (fix: cookie issue)
                  menu_id,
                  quantity,
                  price,
                  subtotal,
                  menu:menu_id (
                    menuid,
                    menuname,
                    price
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

            if (error) return

            setOrders(prevOrders => [newOrderData, ...prevOrders])

            const customerName = newOrderData.users?.username || 'Unknown Customer'
<<<<<<< HEAD
            const itemsCount = newOrderData.order_items?.length || 0
            const totalAmount = newOrderData.total_amount || 0
=======
            const orderItems = newOrderData.order_items || []
            const totalItems = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
            const menuNames = orderItems.map((item: any) => item.menu?.menuname || 'Unknown Item').join(', ')
            const totalPrice = newOrderData.total_amount || 0
>>>>>>> c887188 (fix: cookie issue)

            if (typeof window !== 'undefined' && browserNotificationService) {
              browserNotificationService.showNotification({
                title: `🛎️ New Order #${newOrderData.orderid}`,
<<<<<<< HEAD
                body: `${customerName} ordered ${itemsCount} item(s) - Rp ${totalAmount.toLocaleString('id-ID')}`,
=======
                body: `${customerName} ordered ${totalItems} items (${menuNames}) - Rp ${totalPrice.toLocaleString('id-ID')}`,
>>>>>>> c887188 (fix: cookie issue)
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: `order-${newOrderData.orderid}`,
                requireInteraction: true
              })
            }
          }

          if (payload.eventType === 'UPDATE') {
            const { data: updatedOrderData, error } = await supabase
              .from('orders')
              .select(`
                *,
                order_items (
<<<<<<< HEAD
                  id,
=======
>>>>>>> c887188 (fix: cookie issue)
                  menu_id,
                  quantity,
                  price,
                  subtotal,
                  menu:menu_id (
                    menuid,
                    menuname,
                    price
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

            if (error) return

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
      supabase.removeChannel(channel)
    }
  }, [initialOrders, supabase])

  return orders
}