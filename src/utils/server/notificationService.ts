'use server'

import { createClient } from '@/utils/supabase/server'
import webpush from 'web-push'
import { getUserPushSubscriptions } from './pushSubscriptions'

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface OrderStatusNotification {
  orderId: number
  userId: string
  statusName: string
  userName?: string
}

export async function sendOrderStatusNotification({
  orderId,
  userId,
  statusName,
  userName
}: OrderStatusNotification) {
  try {
    // Get user's push subscriptions
    const subscriptions = await getUserPushSubscriptions(userId)
    
    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`)
      return { success: true, message: 'No subscriptions' }
    }

    // Create notification payload based on status
    const payload = createNotificationPayload(orderId, statusName, userName)
    
    // Send notifications to all user's subscriptions
    const promises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload))
        console.log(`Push notification sent successfully to ${subscription.endpoint}`)
        return { success: true, endpoint: subscription.endpoint }
      } catch (error) {
        console.error(`Failed to send push notification to ${subscription.endpoint}:`, error)
        
        // If subscription is invalid, remove it from database
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as any).statusCode
          if (statusCode === 410 || statusCode === 404) {
            console.log(`Removing invalid subscription: ${subscription.endpoint}`)
            await removeInvalidSubscription(subscription.endpoint)
          }
        }
        
        return { success: false, endpoint: subscription.endpoint, error }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length
    
    console.log(`Sent ${successCount}/${results.length} push notifications for order ${orderId}`)
    
    return {
      success: true,
      sent: successCount,
      total: results.length,
      results
    }
  } catch (error) {
    console.error('Error sending order status notification:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

function createNotificationPayload(orderId: number, statusName: string, userName?: string) {
  const statusMessages = {
    pending: {
      title: '📋 Pesanan Diterima',
      body: `Pesanan #${orderId} telah diterima dan sedang diproses.`
    },
    processing: {
      title: '👨‍🍳 Pesanan Sedang Diproses',
      body: `Pesanan #${orderId} sedang diproses. Estimasi 15-20 menit.`
    },
    ready: {
      title: '✅ Pesanan Siap!',
      body: `Pesanan #${orderId} sudah siap! Silakan diambil.`
    },
    completed: {
      title: '🎉 Pesanan Selesai',
      body: `Pesanan #${orderId} telah selesai. Terima kasih!`
    },
    success: {
      title: '🎉 Pesanan Berhasil',
      body: `Pesanan #${orderId} telah berhasil diselesaikan.`
    },
    rejected: {
      title: '❌ Pesanan Ditolak',
      body: `Maaf, pesanan #${orderId} ditolak. Silakan hubungi kami untuk info lebih lanjut.`
    },
    cancelled: {
      title: '🚫 Pesanan Dibatalkan',
      body: `Pesanan #${orderId} telah dibatalkan.`
    }
  }

  const statusKey = statusName.toLowerCase() as keyof typeof statusMessages
  const message = statusMessages[statusKey] || {
    title: '📱 Update Pesanan',
    body: `Status pesanan #${orderId} telah diperbarui menjadi ${statusName}.`
  }

  return {
    title: message.title,
    body: message.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      orderId,
      statusName,
      userName,
      url: `/order/${orderId}`,
      timestamp: new Date().toISOString()
    },
    actions: [
      {
        action: 'view',
        title: 'Lihat Pesanan',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Tutup'
      }
    ],
    requireInteraction: false,
    silent: false
  }
}

async function removeInvalidSubscription(endpoint: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)

    if (error) {
      console.error('Error removing invalid subscription:', error)
    } else {
      console.log('Invalid subscription removed successfully')
    }
  } catch (error) {
    console.error('Error removing invalid subscription:', error)
  }
}
