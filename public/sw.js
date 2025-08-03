const CACHE_NAME = 'kantin-digital-v1'

self.addEventListener('install', (event) => {
  console.log('Service Worker installing')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  console.log('Push received:', event)

  const payload = event.data ? event.data.json() : {}
  const { title, body, icon, badge, data } = payload

  const options = {
    body,
    icon: icon || '/icon-192x192.png',
    badge: badge || '/icon-192x192.png',
    data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Order',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title || 'New Order', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  const data = event.notification.data || {}
  const orderId = data.orderId
  
  let targetUrl = '/orders' // Default fallback

  // Determine target URL based on action and data
  if (event.action === 'view' && orderId) {
    targetUrl = `/order/${orderId}`
  } else if (event.action === 'dismiss') {
    // Just close the notification, don't navigate
    return
  } else if (orderId) {
    // Default click with orderId
    targetUrl = `/order/${orderId}`
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window open with our target URL
      for (const client of clients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // If no matching client found, open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})