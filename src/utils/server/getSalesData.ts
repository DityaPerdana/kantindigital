'use server'

import { createClient } from '@/utils/supabase/server'

export interface SalesData {
  date: string
  totalSales: number
  orderCount: number
  revenue: number
}

export async function getSalesData(): Promise<SalesData[]> {
  const supabase = await createClient()
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      menu:menu_id (
        price
      )
    `)
    .order('orderedat', { ascending: true })

  if (error) {
    console.error('Error fetching sales data:', error)
    return []
  }

  if (!orders || orders.length === 0) {
    return []
  }

  // Group orders by date and calculate daily sales
  const salesByDate: Record<string, SalesData> = orders.reduce((acc, order) => {
    const date = new Date(order.orderedat).toISOString().split('T')[0]
    const totalPrice = (order.menu?.price || 0) * order.quantity
    
    if (!acc[date]) {
      acc[date] = {
        date,
        totalSales: 0,
        orderCount: 0,
        revenue: 0
      }
    }
    
    acc[date].totalSales += totalPrice
    acc[date].orderCount += 1
    acc[date].revenue += totalPrice
    
    return acc
  }, {} as Record<string, SalesData>)

  // Convert to array
  const result: SalesData[] = Object.values(salesByDate)
  return result
}