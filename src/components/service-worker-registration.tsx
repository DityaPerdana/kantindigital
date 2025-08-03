'use client'

import { browserNotificationService } from '@/utils/pushNotification'
import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker when app loads
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      browserNotificationService.registerServiceWorker()
        .then((registration) => {
          if (registration) {
            console.log('Service Worker registered successfully')
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return null // This component doesn't render anything
}
