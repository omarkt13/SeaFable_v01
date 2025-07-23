
"use client"

import { useState } from 'react'
import { BusinessSidebar } from "@/components/navigation/BusinessSidebar"
import { Button } from "@/components/ui/button"
import { Menu, Bell, User, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

interface BusinessLayoutWrapperProps {
  children: React.ReactNode
  title?: string
}

export function BusinessLayoutWrapper({ children, title }: BusinessLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { businessProfile } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <BusinessSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-0 min-w-0">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 shrink-0 bg-white shadow border-b border-gray-200">
          <div className="flex w-full">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
              {/* Title */}
              <div className="flex items-center">
                {title && (
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                )}
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                <button className="rounded-full bg-white p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <Search className="h-5 w-5" />
                </button>
                <button className="rounded-full bg-white p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
