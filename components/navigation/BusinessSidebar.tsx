"use client"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Ship,
  Anchor,
  X,
  MessageSquare,
  Settings,
  Plus,
  Building2,
  Eye,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { mockBusinessData } from "@/lib/mock-data"

export function BusinessSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { businessProfile, signOut } = useAuth()

  const navigation = [
    { name: "Dashboard", icon: BarChart3, href: "/business/dashboard", current: true },
    { name: "Bookings", icon: Calendar, href: "/business/bookings", current: false },
    { name: "Experiences", icon: Ship, href: "/business/experiences", current: false },
    { name: "Analytics", icon: TrendingUp, href: "/business/earnings", current: false }, // Earnings page will contain analytics
    { name: "Messages", icon: MessageSquare, href: "#", current: false }, // Placeholder
    { name: "Settings", icon: Settings, href: "/business/settings", current: false },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Anchor className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SeaFable</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.href === window.location.pathname // Simple active state check
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

        {/* Business Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" /> {/* Changed Building to Building2 */}
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
