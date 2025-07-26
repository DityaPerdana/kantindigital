'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/utils/server/updateOrderStatus'
import { useRealtimeOrders } from '@/hooks/useRealTimeOrders'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Order {
  orderid: number
  quantity: number
  message: string
  orderedat: string
  menu_id: number
  user_id: string
  status_id: number
  menu?: {
    menuid: number
    menuname: string
    price: number
  }
  users?: {
    userid: string
    username: string
    email: string
  }
  status?: {
    statusid: number
    statusname: string
  }
}

interface Status {
  statusid: number
  statusname: string
}

interface OrdersTableProps {
  initialOrders: Order[]
  statuses: Status[]
}

export function OrdersTable({ initialOrders, statuses }: OrdersTableProps) {
  const [updating, setUpdating] = useState<number | null>(null)
  const orders = useRealtimeOrders(initialOrders)

  const handleStatusChange = async (orderId: number, statusId: string) => {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, parseInt(statusId))
    } catch (error) {
      // Silent error handling
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusName = (statusId: number) => {
    const status = statuses.find(s => s.statusid === statusId)
    return status?.statusname || 'Unknown'
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">
            Real-time updates • {orders.length} orders
          </span>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Menu</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order: Order) => (
            <TableRow key={order.orderid}>
              <TableCell>#{order.orderid}</TableCell>
              <TableCell>
                {order.users?.username || 'Unknown'}
              </TableCell>
              <TableCell>{order.menu?.menuname || 'Unknown'}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>
                Rp {((order.menu?.price || 0) * order.quantity).toLocaleString('id-ID')}
              </TableCell>
              <TableCell>{order.message || '-'}</TableCell>
              <TableCell>
                {new Date(order.orderedat).toLocaleDateString('id-ID')}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status?.statusname || getStatusName(order.status_id))}>
                  {order.status?.statusname || getStatusName(order.status_id)}
                </Badge>
              </TableCell>
              <TableCell>
                <Select
                  value={order.status_id.toString()}
                  onValueChange={(value) => handleStatusChange(order.orderid, value)}
                  disabled={updating === order.orderid}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.statusid} value={status.statusid.toString()}>
                        {status.statusname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}