'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { updateOrderStatus } from '@/utils/server/updateOrderStatus'
import { useMemo, useState } from 'react'

// Define order interface specific to this component with complete types
interface OrderItem {
  id: number
  menu_id: number
  quantity: number
  price: number
  subtotal: number
  menu?: {
    menuid: number
    menuname: string
    price: number
    stok: number
    category_id: number
    image_url: string
  }
}

interface Order {
  orderid: number
  message: string
  orderedat: string
  user_id: string
  status_id: number
  total_amount: number
  order_items?: OrderItem[]
  user?: {
    userid: string
    username: string
    email: string
    role_id: number
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
  
  // Add error handling for invalid props
  if (!initialOrders || !Array.isArray(initialOrders)) {
    return <div>No orders data available</div>
  }
  
  if (!statuses || !Array.isArray(statuses)) {
    return <div>No status data available</div>
  }
  
  const orders = initialOrders

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    const pending = orders.filter((order: any) => {
      const statusName = order.status?.statusname || getStatusName(order.status_id)
      return statusName.toLowerCase() === 'pending'
    })
    
    const success = orders.filter((order: any) => {
      const statusName = order.status?.statusname || getStatusName(order.status_id)
      return statusName.toLowerCase() === 'success'
    })
    
    const rejected = orders.filter((order: any) => {
      const statusName = order.status?.statusname || getStatusName(order.status_id)
      return statusName.toLowerCase() === 'rejected'
    })
    
    return { pending, success, rejected, all: orders }
  }, [orders, statuses])

  const handleStatusChange = async (orderId: number, statusId: string) => {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, parseInt(statusId))
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusName = (statusId: number): string => {
    const status = statuses.find(s => s.statusid === statusId)
    return status?.statusname || 'Unknown'
  }

  const getStatusColor = (statusName: string): string => {
    switch (statusName.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500 text-white hover:bg-yellow-600'
      case 'success':
        return 'bg-green-500 text-white hover:bg-green-600'
      case 'rejected':
        return 'bg-red-500 text-white hover:bg-red-600'
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600'
    }
  }

  // Component for individual order table
  const OrderTable = ({ ordersList, title }: { ordersList: any[], title: string }) => (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersList.map((order: any) => (
            <TableRow key={order.orderid}>
              <TableCell>#{order.orderid}</TableCell>
              <TableCell>
                {order.user?.username || 'Unknown'}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {order.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      {item.menu?.menuname || '-'} x{item.quantity}
                    </div>
                  )) || <span className="text-muted-foreground">No items</span>}
                </div>
              </TableCell>
              <TableCell>
                Rp {order.total_amount ? order.total_amount.toLocaleString('id-ID') : '0'}
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

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger 
          value="all"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          All ({filteredOrders.all.length})
        </TabsTrigger>
        <TabsTrigger 
          value="pending"
          className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
        >
          Pending ({filteredOrders.pending.length})
        </TabsTrigger>
        <TabsTrigger 
          value="success"
          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
        >
          Success ({filteredOrders.success.length})
        </TabsTrigger>
        <TabsTrigger 
          value="rejected"
          className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
        >
          Rejected ({filteredOrders.rejected.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-4">
        <OrderTable ordersList={filteredOrders.all} title="All" />
      </TabsContent>
      
      <TabsContent value="pending" className="mt-4">
        <OrderTable ordersList={filteredOrders.pending} title="Pending" />
      </TabsContent>
      
      <TabsContent value="success" className="mt-4">
        <OrderTable ordersList={filteredOrders.success} title="Success" />
      </TabsContent>
      
      <TabsContent value="rejected" className="mt-4">
        <OrderTable ordersList={filteredOrders.rejected} title="Rejected" />
      </TabsContent>
    </Tabs>
  )
}