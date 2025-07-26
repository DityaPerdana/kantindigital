'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client'
import { browserNotificationService } from "../utils/pushNotification"

interface Order {
  orderid: number
  quantity: number
  message: string
  orderedat: string
  menu_id: number
  user_id: string
  status_id: number
  menu?: {
    menuid: number
    menuname: string
    price: number
  }
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
                menu:menu_id (
                  menuid,
                  menuname,
                  price
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
            const menuName = newOrderData.menu?.menuname || 'Unknown Item'
            const totalPrice = (newOrderData.menu?.price || 0) * newOrderData.quantity

            if (typeof window !== 'undefined' && browserNotificationService) {
              browserNotificationService.showNotification({
                title: `🛎️ New Order #${newOrderData.orderid}`,
                body: `${customerName} ordered ${newOrderData.quantity}x ${menuName} - Rp ${totalPrice.toLocaleString('id-ID')}`,
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
                menu:menu_id (
                  menuid,
                  menuname,
                  price
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