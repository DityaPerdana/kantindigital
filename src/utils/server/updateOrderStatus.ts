'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: number, statusId: number) {
  const supabase = await createClient(); 

  const { error } = await supabase
    .from('orders')
    .update({ status_id: statusId }) // The update operation
    .eq('orderid', orderId);         // For a specific order

  if (error) {
    console.error("Error updating order status:", error);
    throw new Error('Failed to update order status');
  }

  // Revalidate the cache for paths that display order info
  revalidatePath('/dashboard/order');
  revalidatePath('/dashboard');
}

export async function getOrders() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
<<<<<<< HEAD
      *,
      order_items (
        id,
        menu_id,
        quantity,
        price,
        subtotal,
        menu:menu_id (
          menuid,
          menuname,
          price
        )
      ),
=======
      orderid,
      message,
      orderedat,
      total_amount,
>>>>>>> c887188 (fix: cookie issue)
      users:user_id (
        userid,
        username,
        email
      ),
      status:status_id (
        statusid,
        statusname
      ),
      order_items (
        quantity,
        price,
        menu:menu_id (
          menuname,
          image_url
        )
      )
    `)
    .order('orderedat', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }

  return orders || [];
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