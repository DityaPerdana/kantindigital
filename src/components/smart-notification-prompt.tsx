'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { browserNotificationService } from '@/utils/pushNotification'
import { Bell, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface NotificationPromptProps {
  delay?: number // Delay in seconds before showing prompt
  showOnFirstVisit?: boolean
  showAfterOrderCompleted?: boolean
}

export function SmartNotificationPrompt({ 
  delay = 10, 
  showOnFirstVisit = true,
  showAfterOrderCompleted = true 
}: NotificationPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Only show prompt if permission is default (not asked yet)
    if (Notification.permission !== 'default') {
      return
    }

    // Check if user has been prompted before
    const hasBeenPrompted = localStorage.getItem('notification-prompted')
    const promptDismissed = localStorage.getItem('notification-prompt-dismissed')
    
    if (promptDismissed) {
      return // User dismissed the prompt before
    }

    let shouldShow = false

    if (showOnFirstVisit && !hasBeenPrompted) {
      shouldShow = true
    }

    if (showAfterOrderCompleted) {
      const orderCompleted = sessionStorage.getItem('order-completed')
      if (orderCompleted && !hasBeenPrompted) {
        shouldShow = true
      }
    }

    if (shouldShow) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
        localStorage.setItem('notification-prompted', 'true')
      }, delay * 1000)

      return () => clearTimeout(timer)
    }
  }, [delay, showOnFirstVisit, showAfterOrderCompleted])

  const handleEnableNotifications = async () => {
    try {
      const hasPermission = await browserNotificationService.requestPermission()
      if (hasPermission) {
        const subscribed = await browserNotificationService.subscribeToPush()
        if (subscribed) {
          setPermission('granted')
          setShowPrompt(false)
          
          // Show confirmation notification
          await browserNotificationService.showNotification({
            title: '🔔 Notifikasi Aktif!',
            body: 'Anda akan mendapat update status pesanan secara real-time.',
            icon: '/icon-192x192.png'
          })
        }
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('notification-prompt-dismissed', 'true')
  }

  const handleNotNow = () => {
    setShowPrompt(false)
    // Don't mark as dismissed, can show again later
  }

  if (!showPrompt || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2">
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-sm font-semibold text-gray-800">
                Aktifkan Notifikasi
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-xs text-gray-600">
            Dapatkan update real-time status pesanan Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleEnableNotifications}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <Bell className="w-3 h-3 mr-1" />
              Aktifkan
            </Button>
            <Button
              onClick={handleNotNow}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              Nanti
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook to trigger notification prompt after order completion
export function useOrderCompletionPrompt() {
  const triggerPrompt = () => {
    sessionStorage.setItem('order-completed', 'true')
    // Remove the flag after a short delay to prevent multiple triggers
    setTimeout(() => {
      sessionStorage.removeItem('order-completed')
    }, 5000)
  }

  return { triggerPrompt }
}
