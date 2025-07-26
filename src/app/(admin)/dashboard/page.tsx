import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SiteHeader } from "@/components/site-header"
import { OrdersTable } from "@/components/dashboard/oderTable"
import { NotificationSetup } from "@/components/notification-setup"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getOrders, getStatuses } from "@/utils/server/updateOrderStatus"
import { getSalesData } from "@/utils/server/getSalesData"

export default async function Page() {
  try {
    const [orders, statuses, salesData] = await Promise.all([
      getOrders(),
      getStatuses(),
      getSalesData()
    ])

    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <NotificationSetup />
                </div>              
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive salesData={salesData} />
                </div>
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Management</CardTitle>
                      <CardDescription>Real-time order monitoring</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <OrdersTable initialOrders={orders} statuses={statuses} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  } catch (error) {
    return (
      <div className="p-4">
        <p>Error loading dashboard</p>
      </div>
    )
  }
}