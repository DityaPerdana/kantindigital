'use client'

import { OrdersTable } from './oderTable'

interface OrdersTableClientProps {
  initialOrders: any[]
  statuses: any[]
}

export function OrdersTableClient({ initialOrders, statuses }: OrdersTableClientProps) {
  return <OrdersTable initialOrders={initialOrders} statuses={statuses} />
}
