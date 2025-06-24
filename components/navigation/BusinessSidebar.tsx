"use client"
import Link from "next/link"
import {
  Home,
  Calendar,
  Users,
  DollarSign,
  BookOpen,
  Users2,
  Globe,
  BarChart,
  Settings,
  Plus,
  Eye,
  LogOut,
  Anchor,
  X,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { mockBusinessData } from "@/lib/mock-data"

export function BusinessSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { businessProfile, signOut } = useAuth()

  const navigation = [
    { name: "Home", icon: Home, href: "/business/dashboard" },
    { name: "Calendar", icon: Calendar, href: "/business/calendar" },
    { name: "Clients", icon: Users, href: "/business/clients" },
    { name: "Sales", icon: DollarSign, href: "/business/sales" },
    { name: "Catalogue", icon: BookOpen, href: "/business/experiences" }, // Re-using existing experiences page
    { name: "Team", icon: Users2, href: "/business/team" },
    { name: "Online bookings", icon: Globe, href: "/business/online-bookings" },
    { name: "Reports", icon: BarChart, href: "/business/reports" },
    { name: "Settings", icon: Settings, href: "/business/settings" },
  ]

  return (
    <>
      {/* Mobile backdrop - only visible on mobile when sidebar is open */}
      {isOpen && <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={onClose} />}

      {/* Unified Sidebar Element */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-200 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:flex lg:flex-col lg:flex-shrink-0
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Anchor className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SeaFable</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 flex-1 overflow-y-auto">
          {" "}
          {/* flex-1 and overflow-y-auto for scrollable content */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.href === window.location.pathname
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={onClose} // Close sidebar on navigation for mobile
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-1">
            <Link
              href="/business/experiences/new"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={onClose}
            >
              <Plus className="mr-3 h-5 w-5" />
              Add New Experience
            </Link>
            <Link
              href="/"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={onClose}
            >
              <Eye className="mr-3 h-5 w-5" />
              View Customer Site
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => {
                signOut()
                onClose()
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </nav>

        {/* Business Profile Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {businessProfile?.businessName || mockBusinessData.businessProfile.name}
              </p>
              <p className="text-xs text-gray-500">
                {businessProfile?.businessType || mockBusinessData.businessProfile.type}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
