"use client"

import type React from "react"
import { CustomerProtectedRoute } from "@/components/auth/CustomerProtectedRoute"
import { CustomerNavigation } from "@/components/navigation/CustomerNavigation"

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProtectedRoute>
      {/* Use a theme-consistent background color.  Consider using a tailwind theme class or a direct color value that aligns with the intended theme. */}
      <div className="min-h-screen bg-white">
        <CustomerNavigation />
        {/* Use a theme-consistent background color for the main content area as well. */}
        <main className="bg-white">{children}</main>
      </div>
    </CustomerProtectedRoute>
  )
}