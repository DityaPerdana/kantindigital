import { SalesDataPoint } from '@/components/chart-area-interactive';
import { createClient } from '@/utils/supabase/server';

export async function getSalesData(): Promise<SalesDataPoint[]> {
  const supabase = await createClient()

  // Fetch orders with order items
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

  // Group sales by date
  const salesByDate: Record<string, { revenue: number; orderCount: number }> = {};
  orders?.forEach((order: any) => {
    const date = new Date(order.orderedat).toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = { revenue: 0, orderCount: 0 };
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
}