'use server'

import { createClient } from '@/utils/supabase/server'

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function savePushSubscription(subscription: PushSubscription) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,endpoint'
    })

  if (error) {
    console.error('Error saving push subscription:', error)
    throw new Error('Failed to save push subscription')
  }

  return { success: true }
}

export async function getUserPushSubscriptions(userId: string) {
  const supabase = await createClient()

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching push subscriptions:', error)
    return []
  }

  return subscriptions?.map(sub => ({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth
    }
  })) || []
}

export async function removePushSubscription(endpoint: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('Error removing push subscription:', error)
    throw new Error('Failed to remove push subscription')
  }

  return { success: true }
}
