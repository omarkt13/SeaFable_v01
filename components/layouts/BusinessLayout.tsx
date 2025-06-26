"use client"

import type React from "react"
import { useState } from "react"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessSidebar } from "@/components/navigation/BusinessSidebar"
import { Menu, Bell, Star, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { mockBusinessData } from "@/lib/mock-data"

export function BusinessLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { businessProfile, signOut } = useAuth()

  return (
    <BusinessProtectedRoute>
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <BusinessSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          {/* Top bar */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center">
                {/* Mobile menu button - only visible on mobile */}
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {businessProfile?.businessName || mockBusinessData.businessProfile.name}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="h-3 w-3 mr-1 text-yellow-400" />
                      {mockBusinessData.businessProfile.rating} • {mockBusinessData.businessProfile.totalReviews}{" "}
                      reviews
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content with better background */}
          <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
        </div>
      </div>
    </BusinessProtectedRoute>
  )
}
