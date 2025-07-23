'use client'

import type React from "react"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"

export function BusinessLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProtectedRoute>
      <BusinessLayout>
        {children}
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}