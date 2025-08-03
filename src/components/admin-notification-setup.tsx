'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { browserNotificationService } from '@/utils/pushNotification'
import { Bell, BellOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function AdminNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleEnableNotifications = async () => {
    try {
      console.log('Starting admin notification setup...')
      
      const hasPermission = await browserNotificationService.requestPermission()
      console.log('Permission granted:', hasPermission)
      
      if (hasPermission) {
        // Subscribe to push notifications
        console.log('Attempting to subscribe to push notifications...')
        const subscribed = await browserNotificationService.subscribeToPush()
        console.log('Subscription result:', subscribed)
        
        if (subscribed) {
          setPermission('granted')
          // Show test notification
          await browserNotificationService.showNotification({
            title: 'Notifikasi Admin Diaktifkan!',
            body: 'Anda akan menerima notifikasi untuk pesanan baru dan update status.',
            icon: '/icon-192x192.png'
          })
        } else {
          console.error('Failed to subscribe to push notifications')
          alert('Gagal mengaktifkan push notifications. Silakan coba lagi.')
        }
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error)
      alert('Terjadi kesalahan saat mengaktifkan notifikasi: ' + (error as Error).message)
    }
  }

  if (permission === 'denied') {
    return (
      <Card className="mb-4 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <BellOff className="h-5 w-5" />
            Notifikasi Diblokir
          </CardTitle>
          <CardDescription className="text-red-600">
            Aktifkan notifikasi di pengaturan browser untuk mendapatkan alert pesanan baru.
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
            Aktifkan Notifikasi Admin
          </CardTitle>
          <CardDescription className="text-blue-600">
            Dapatkan notifikasi langsung ketika ada pesanan baru dari customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleEnableNotifications} className="bg-blue-600 hover:bg-blue-700">
            <Bell className="mr-2 h-4 w-4" />
            Aktifkan Notifikasi
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
          Notifikasi Admin Aktif ✓
        </CardTitle>
        <CardDescription className="text-green-600">
          Anda akan menerima notifikasi untuk pesanan baru dan update status.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
