"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconUsers,
  IconHome,
  IconInnerShadowTop,
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainNav = [
  { title: "Dashboard", href: "#", icon: IconDashboard },
  { title: "Home", href: "/", icon: IconHome },
  { title: "Reservations", href: "#", icon: IconListDetails },
  { title: "Venue Settings", href: "#", icon: IconChartBar },
  { title: "Notifications", href: "#", icon: IconFolder },
]

const bottomNav = [
  { title: "Settings", href: "#", icon: IconUsers },
]

export function AppSidebar(props) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header */}
      <SidebarHeader className="bg-[#021226]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <IconInnerShadowTop className="!size-5 !text-white" />
                <span className="text-base text-white font-semibold">Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Menu */}
      <SidebarContent className="!bg-[#021226] !text-white">
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                >
                  <item.icon className="!size-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-[#021226] border-t border-white/10">
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                >
                  <item.icon className="!size-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
