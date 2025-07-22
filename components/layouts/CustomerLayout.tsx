"use client"

import type React from "react"
import { CustomerProtectedRoute } from "@/components/auth/CustomerProtectedRoute"
import { CustomerNavigation } from "@/components/navigation/CustomerNavigation"
import { SidebarTrigger } from "@/components/ui/Sidebar"

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProtectedRoute>
      {/* Use a theme-consistent background color.  Consider using a tailwind theme class or a direct color value that aligns with the intended theme. */}
      <div className="min-h-screen bg-white">
        <CustomerNavigation />
        <SidebarTrigger
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        />
        {/* Use a theme-consistent background color for the main content area as well. */}
        <main className="bg-white">{children}</main>
      </div>
    </CustomerProtectedRoute>
  )
}