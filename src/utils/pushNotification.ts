'use client'

import { removePushSubscription, savePushSubscription } from './server/pushSubscriptions'

class BrowserNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null

  async requestPermission(): Promise<boolean> {
    // Check if running in browser
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications are not supported or not in browser environment')
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

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported or not in browser environment')
      return null
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully')
      return this.swRegistration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }

  async subscribeToPush(): Promise<boolean> {
    try {
      console.log('Starting push subscription process...')
      
      // Register service worker first
      if (!this.swRegistration) {
        console.log('Registering service worker...')
        this.swRegistration = await this.registerServiceWorker()
      }

      if (!this.swRegistration) {
        console.error('Service Worker not available')
        return false
      }

      // Request notification permission
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        console.warn('Notification permission denied')
        return false
      }

      // Get existing subscription or create new one
      let subscription = await this.swRegistration.pushManager.getSubscription()
      console.log('Existing subscription:', subscription)

      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        console.log('VAPID key available:', !!vapidPublicKey)
        
        if (!vapidPublicKey) {
          console.error('VAPID public key not found')
          return false
        }

        console.log('Creating new push subscription...')
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        })
        console.log('New subscription created:', subscription)
      }

      // Save subscription to server
      console.log('Saving subscription to server...')
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }
      console.log('Subscription data to save:', subscriptionData)
      
      await savePushSubscription(subscriptionData)

      console.log('Push subscription saved successfully')
      return true
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      return false
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!this.swRegistration) {
        this.swRegistration = await navigator.serviceWorker.getRegistration() || null
      }

      if (!this.swRegistration) {
        console.warn('Service Worker not registered')
        return true // Consider it successful if no SW is registered
      }

      const subscription = await this.swRegistration.pushManager.getSubscription()
      
      if (subscription) {
        // Remove from server first
        await removePushSubscription(subscription.endpoint)
        
        // Then unsubscribe from browser
        await subscription.unsubscribe()
        console.log('Push subscription removed successfully')
      }

      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  async showNotification(options: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    requireInteraction?: boolean
    data?: any
  }) {
    // Check if running in browser
    if (typeof window === 'undefined') {
      console.warn('Cannot show notification: not in browser environment')
      return
    }
    
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
      data: options.data
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
      // Navigate to orders page for better UX
      if (window.location.pathname !== '/orders') {
        window.location.href = '/orders'
      }
    }

    return notification
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

export const browserNotificationService = new BrowserNotificationService()