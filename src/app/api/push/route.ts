import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { subscription, payload } = await request.json()

    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}