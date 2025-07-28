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

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      self.clients.openWindow('/dashboard')
    )
  }
})