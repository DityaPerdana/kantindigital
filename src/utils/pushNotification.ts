'use client'

class BrowserNotificationService {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  async showNotification(options: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    requireInteraction?: boolean
  }) {
    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      console.warn('No notification permission')
      return
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/icon-192x192.png',
      tag: options.tag || 'order-notification',
      requireInteraction: options.requireInteraction || true,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
      // Navigate to dashboard if not already there
      if (window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard'
      }
    }

    return notification
  }
}

export const browserNotificationService = new BrowserNotificationService()