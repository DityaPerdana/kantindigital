'use client'

import { browserNotificationService } from '@/utils/pushNotification'
import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client'

export function useRealtimeOrder(initialOrder: any) {
  const [order, setOrder] = useState(initialOrder)
  const supabase = createClient()

  useEffect(() => {
    if (!initialOrder?.orderid) return
    // Only run on client side
    if (typeof window === 'undefined') return

    // Subscribe to order status updates for this specific order
    const orderSubscription = supabase
      .channel(`order_${initialOrder.orderid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `orderid=eq.${initialOrder.orderid}`
        },
        async (payload) => {
          console.log('Order status updated:', payload)
          
          // Get current user to check if this is their order
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          
          // Fetch the updated order data with relations
          const { data: updatedOrderData } = await supabase
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
            .eq('orderid', payload.new.orderid)
            .single()

          if (updatedOrderData) {
            setOrder(updatedOrderData)

            // Show local notification if this is the current user's order and status changed
            if (currentUser && currentUser.id === updatedOrderData.user_id) {
              const oldStatus = payload.old?.status_id
              const newStatus = payload.new?.status_id
              const statusData = Array.isArray(updatedOrderData.status) ? updatedOrderData.status[0] : updatedOrderData.status
              
              if (oldStatus !== newStatus && statusData?.statusname) {
                try {
                  const statusName = statusData.statusname.toLowerCase()
                  const orderNumber = updatedOrderData.orderid
                  
                  let notificationConfig = {
                    title: '📱 Update Pesanan',
                    body: `Pesanan #${orderNumber} telah diperbarui.`,
                    tag: `order-${orderNumber}`,
                    icon: '/icon-192x192.png',
                    data: {
                      url: `/order/${orderNumber}`
                    }
                  }

                  // Customize notification based on status
                  switch (statusName) {
                    case 'processing':
                    case 'diproses':
                      notificationConfig = {
                        title: '👨‍🍳 Pesanan Sedang Diproses',
                        body: `Pesanan #${orderNumber} sedang diproses. Estimasi 15-20 menit.`,
                        tag: `order-${orderNumber}`,
                        icon: '/icon-192x192.png',
                        data: {
                          url: `/order/${orderNumber}`
                        }
                      }
                      break
                    case 'ready':
                    case 'siap':
                      notificationConfig = {
                        title: '✅ Pesanan Siap!',
                        body: `Pesanan #${orderNumber} sudah siap! Silakan diambil.`,
                        tag: `order-${orderNumber}`,
                        icon: '/icon-192x192.png',
                        data: {
                          url: `/order/${orderNumber}`
                        }
                      }
                      break
                    case 'completed':
                    case 'selesai':
                    case 'success':
                    case 'sukses':
                      notificationConfig = {
                        title: '🎉 Pesanan Selesai',
                        body: `Pesanan #${orderNumber} telah selesai. Terima kasih!`,
                        tag: `order-${orderNumber}`,
                        icon: '/icon-192x192.png',
                        data: {
                          url: `/order/${orderNumber}`
                        }
                      }
                      break
                    case 'rejected':
                    case 'ditolak':
                      notificationConfig = {
                        title: '❌ Pesanan Ditolak',
                        body: `Maaf, pesanan #${orderNumber} ditolak.`,
                        tag: `order-${orderNumber}`,
                        icon: '/icon-192x192.png',
                        data: {
                          url: `/order/${orderNumber}`
                        }
                      }
                      break
                    case 'cancelled':
                    case 'dibatalkan':
                      notificationConfig = {
                        title: '🚫 Pesanan Dibatalkan',
                        body: `Pesanan #${orderNumber} telah dibatalkan.`,
                        tag: `order-${orderNumber}`,
                        icon: '/icon-192x192.png',
                        data: {
                          url: `/order/${orderNumber}`
                        }
                      }
                      break
                  }

                  await browserNotificationService.showNotification(notificationConfig)
                } catch (error) {
                  console.error('Error showing local notification:', error)
                }
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      orderSubscription.unsubscribe()
    }
  }, [initialOrder?.orderid, supabase])

  return order
}
