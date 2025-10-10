"use client"

import { motion } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json" assert { type: "json" }

export default function Page() {
  return (
    <SidebarProvider
      className="!bg-[#021226]"
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}
    >
      {/* Sidebar animation */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AppSidebar variant="inset" />
      </motion.div>

      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-[#000A17]">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />

              <div className="px-4 lg:px-6"></div>

              {/* DataTable animation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              >
                <DataTable data={data} />
              </motion.div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
