'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendOrderStatusNotification } from './notificationService';

export async function updateOrderStatus(orderId: number, statusId: number) {
  const supabase = await createClient(); 

  // First, get the order details before updating
  const { data: orderBefore, error: fetchError } = await supabase
    .from('orders')
    .select(`
      orderid,
      user_id,
      status_id,
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
    .eq('orderid', orderId)
    .single()

  if (fetchError || !orderBefore) {
    console.error("Error fetching order before update:", fetchError);
    throw new Error('Failed to fetch order details');
  }

  // Update the order status
  const { error } = await supabase
    .from('orders')
    .update({ status_id: statusId }) // The update operation
    .eq('orderid', orderId);         // For a specific order

  if (error) {
    console.error("Error updating order status:", error);
    throw new Error('Failed to update order status');
  }

  // Get the new status name
  const { data: newStatus, error: statusError } = await supabase
    .from('status')
    .select('statusname')
    .eq('statusid', statusId)
    .single()

  if (statusError || !newStatus) {
    console.error("Error fetching new status:", statusError);
    // Don't throw error here, update was successful
  }

  // Send push notification if status changed and we have the necessary data
  if (newStatus && orderBefore.status_id !== statusId) {
    try {
      const userData = Array.isArray(orderBefore.users) ? orderBefore.users[0] : orderBefore.users;
      await sendOrderStatusNotification({
        orderId: orderBefore.orderid,
        userId: orderBefore.user_id,
        statusName: newStatus.statusname,
        userName: userData?.username
      });
      console.log(`Push notification sent for order ${orderId} status change to ${newStatus.statusname}`);
    } catch (notificationError) {
      console.error('Failed to send push notification:', notificationError);
      // Don't throw error here, order update was successful
    }
  }

  // Revalidate the cache for paths that display order info
  revalidatePath('/dashboard/order');
  revalidatePath('/dashboard');
  revalidatePath('/orders');
  revalidatePath(`/order/${orderId}`);
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