"use client"

import type React from "react"

import { useState } from "react"
import { BusinessSidebar } from "@/components/navigation/BusinessSidebar"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface BusinessLayoutProps {
  children: React.ReactNode
}

export function BusinessLayout({ children }: BusinessLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { businessProfile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          {businessProfile?.business_name || businessProfile?.contact_name || businessProfile?.name || "Business Dashboard"}
        </h1>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Layout container */}
      <div className="flex">
        {/* Sidebar */}
        <BusinessSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <div className="flex-1 lg:ml-64">
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
