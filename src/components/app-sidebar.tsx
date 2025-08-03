"use client"

import {
    IconChartBar,
    IconDashboard,
    IconListDetails,
    IconTools
} from "@tabler/icons-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Store } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Order",
      url: "/dashboard/order",
      icon: IconDashboard,
    },
    {
      title: "Menu",
      url: "/dashboard/menu",
      icon: IconListDetails,
    },
    {
      title: "Users",
      url: "/dashboard/user",
      icon: IconChartBar,
    },
    {
      title: "Maintenance",
      url: "/dashboard/maintenance",
      icon: IconTools,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Store className="!size-5" />
                <span className="text-base font-semibold">Kantin Digital.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
