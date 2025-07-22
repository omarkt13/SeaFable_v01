"use client"

import type React from "react"
import { CustomerProtectedRoute } from "@/components/auth/CustomerProtectedRoute"
import { CustomerNavigation } from "@/components/navigation/CustomerNavigation"

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <CustomerNavigation />
        <main className="bg-gray-50">{children}</main>
      </div>
    </CustomerProtectedRoute>
  )
}