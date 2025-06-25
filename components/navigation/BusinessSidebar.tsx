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
import { usePathname } from "next/navigation" // Import usePathname

export function BusinessSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { businessProfile, signOut } = useAuth()

  const navigation = [
    { name: "Home", icon: Home, href: "/business/home" },
    { name: "Calendar", icon: Calendar, href: "/business/calendar" },
    { name: "Clients", icon: Users, href: "/business/clients" },
    { name: "Sales", icon: DollarSign, href: "/business/sales" },
    { name: "Catalogue", icon: BookOpen, href: "/business/experiences" },
    { name: "Team", icon: Users2, href: "/business/team" },
    { name: "Online bookings", icon: Globe, href: "/business/online-bookings" },
    { name: "Reports", icon: BarChart, href: "/business/reports" },
    { name: "Settings", icon: Settings, href: "/business/settings" },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* FIXED: Improved sidebar with proper z-index and positioning */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-lg
        `}
        role="navigation"
        aria-label="Business navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Anchor className="h-8 w-8 text-teal-600" />
            <span className="text-xl font-bold text-gray-900">SeaFable</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden hover:bg-gray-100 transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    pathname === item.href
                      ? "bg-teal-50 text-teal-700 border-r-2 border-teal-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                onClick={onClose}
              >
                <item.icon className="mr-3 h-5 w-5 transition-colors" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Secondary Actions */}
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="space-y-1 mb-4">
            <Link
              href="/business/experiences/new"
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              onClick={onClose}
            >
              <Plus className="mr-3 h-5 w-5" />
              Add New Experience
            </Link>
            <Link
              href="/"
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              onClick={onClose}
            >
              <Eye className="mr-3 h-5 w-5" />
              View Customer Site
            </Link>
          </div>

          {/* Business Profile */}
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {businessProfile?.businessName || mockBusinessData.businessProfile.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {businessProfile?.businessType || mockBusinessData.businessProfile.type}
              </p>
            </div>
          </div>

          {/* Sign Out */}
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 mt-2"
            onClick={() => {
              signOut()
              onClose()
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}
