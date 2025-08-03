'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff } from 'lucide-react'
import { browserNotificationService } from '@/utils/pushNotification'

export function NotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleEnableNotifications = async () => {
    try {
      const hasPermission = await browserNotificationService.requestPermission()
      if (hasPermission) {
        setPermission('granted')
      }
    } catch (error) {
    }
  }

  if (permission === 'denied') {
    return (
      <Card className="mb-4 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <BellOff className="h-5 w-5" />
            Notifications Blocked
          </CardTitle>
          <CardDescription className="text-red-600">
            Enable notifications in browser settings for order alerts.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (permission === 'default') {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Bell className="h-5 w-5" />
            Enable Push Notifications
          </CardTitle>
          <CardDescription className="text-blue-600">
            Get instant notifications when new orders arrive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleEnableNotifications} className="bg-blue-600 hover:bg-blue-700">
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Bell className="h-5 w-5" />
          Notifications Enabled ✓
        </CardTitle>
        <CardDescription className="text-green-600">
          You'll receive push notifications for new orders.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}