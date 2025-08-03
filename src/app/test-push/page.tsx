import { NotificationSetup } from '@/components/notification-setup'
import { PushNotificationTester } from '@/components/push-notification-tester'

export default function PushTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Push Notification Testing
          </h1>
          <p className="text-gray-600">
            Test the push notification system for order status updates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Setup Notifications
            </h2>
            <NotificationSetup />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Test Push Notification
            </h2>
            <PushNotificationTester />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            How to Test:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>First, enable notifications using the setup component above</li>
            <li>Then, use the test component to send a push notification</li>
            <li>You should receive both a browser notification and a push notification</li>
            <li>Click on the notification to navigate to the order page</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
