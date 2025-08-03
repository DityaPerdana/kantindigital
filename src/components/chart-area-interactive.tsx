"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"

// Redefine SalesData for chart usage
export interface SalesDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
  totalSales?: number;
}

interface ChartAreaInteractiveProps {
  salesData: SalesDataPoint[];
}

export const description = "Sales analytics chart"

const chartConfig = {
  sales: {
    label: "Sales",
  },
  revenue: {
    label: "Revenue (Rp)",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

// Removed duplicate and incorrect interface

export function ChartAreaInteractive({ salesData }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  // Add error handling for invalid salesData
  if (!salesData || !Array.isArray(salesData)) {
    return (
      <Card className="@container/card">
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No sales data available
          </div>
        </CardContent>
      </Card>
    )
  }

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!salesData || salesData.length === 0) return [];
    const now = new Date();
    let daysToSubtract = 30;
    if (timeRange === "90d") daysToSubtract = 90;
    else if (timeRange === "7d") daysToSubtract = 7;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return salesData
      .filter((item) => {
        const date = new Date(item.date);
        return date >= startDate;
      })
      .map((item) => ({
        ...item,
        orders: item.orderCount, // Map orderCount to orders for chart
        revenue: Math.round(item.revenue / 1000) // Convert to thousands for better display
      }));
  }, [salesData, timeRange]);

  const totalRevenue = filteredData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = filteredData.reduce((sum, item) => sum + (item.orders || 0), 0);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Sales Analytics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Revenue: Rp {totalRevenue.toLocaleString('id-ID')} • Orders: {totalOrders}
          </span>
          <span className="@[540px]/card:hidden">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No sales data available for the selected period
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-orders)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-orders)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("id-ID", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("id-ID", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })
                    }}
                    formatter={(value, name) => {
                      if (name === "revenue") {
                        return [`Rp ${(Number(value) * 1000).toLocaleString('id-ID')}`, "Revenue"]
                      }
                      return [value, "Orders"]
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="orders"
                type="natural"
                fill="url(#fillOrders)"
                stroke="var(--color-orders)"
                stackId="a"
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}