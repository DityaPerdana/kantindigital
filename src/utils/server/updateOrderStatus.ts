'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: number, statusId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status_id: statusId })
    .eq('orderid', orderId)

  if (error) {
    throw new Error('Failed to update order status')
  }

  revalidatePath('/dashboard')
}

export async function getOrders() {
  const supabase = await createClient()
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      menu:menu_id (
        menuid,
        menuname,
        price
      ),
      users:user_id (
        userid,
        username,
        email
      ),
      status:status_id (
        statusid,
        statusname
      )
    `)
    .order('orderedat', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    throw new Error('Failed to fetch orders')
  }

  return orders || []
}

export async function getStatuses() {
  const supabase = await createClient()
  
  const { data: statuses, error } = await supabase
    .from('status')
    .select('*')
    .order('statusid')

  if (error) {
    console.error('Error fetching statuses:', error)
    throw new Error('Failed to fetch statuses')
  }

  return statuses || []
}