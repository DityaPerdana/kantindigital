import { sendOrderStatusNotification } from '@/utils/server/notificationService'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId, statusName } = await request.json()

    if (!orderId || !statusName) {
      return NextResponse.json(
        { success: false, error: 'orderId and statusName are required' },
        { status: 400 }
      )
    }

    // For testing, send notification to current user
    const result = await sendOrderStatusNotification({
      orderId: parseInt(orderId),
      userId: user.id,
      statusName,
      userName: user.user_metadata?.name || user.email
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in test push notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}
