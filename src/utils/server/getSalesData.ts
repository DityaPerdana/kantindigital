<<<<<<< HEAD
import { createClient } from '@/utils/supabase/server'
=======

>>>>>>> c887188 (fix: cookie issue)

import { SalesDataPoint } from '@/components/chart-area-interactive';
import { createClient } from '@/utils/supabase/server';

export async function getSalesData(): Promise<SalesDataPoint[]> {
  const supabase = await createClient()

<<<<<<< HEAD
=======
  // Fetch orders with order items
>>>>>>> c887188 (fix: cookie issue)
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      orderid,
      orderedat,
      total_amount,
      status_id,
      order_items (
        quantity,
        price,
        subtotal
      )
    `)
    .eq('status_id', 2) // Only successful orders
    .order('orderedat', { ascending: true })

  if (error) {
    console.error('Error fetching sales data:', error);
    return [];
  }

<<<<<<< HEAD
  if (!orders || orders.length === 0) {
    return []
  }

  // Group orders by date and calculate daily sales
  const salesByDate: Record<string, SalesData> = orders.reduce((acc, order) => {
    const date = new Date(order.orderedat).toISOString().split('T')[0]
    const totalPrice = order.total_amount || 0
    
    if (!acc[date]) {
      acc[date] = {
        date,
        totalSales: 0,
        orderCount: 0,
        revenue: 0
      }
=======
  // Group sales by date
  const salesByDate: Record<string, { revenue: number; orderCount: number }> = {};
  orders?.forEach((order: any) => {
    const date = new Date(order.orderedat).toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = { revenue: 0, orderCount: 0 };
>>>>>>> c887188 (fix: cookie issue)
    }
    salesByDate[date].revenue += order.total_amount || 0;
    salesByDate[date].orderCount += 1;
  });

  // Convert to array
  return Object.entries(salesByDate).map(([date, { revenue, orderCount }]) => ({
    date,
    revenue,
    orderCount,
  }));

  // (Removed unreachable Chart.js style return block)
}