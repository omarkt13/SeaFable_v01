"use client"
import Link from "next/link"
import { usePathname } from 'next/navigation';
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
// import { mockBusinessData } from "@/lib/mock-data" // Not available

interface BusinessSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function BusinessSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { businessProfile, signOut } = useAuth()
  const pathname = usePathname();

  // Group navigation items according to the design
  const clientManagementItems = [
    { name: "Bookings", icon: Users, href: "/business/bookings" },
    { name: "Experiences", icon: Anchor, href: "/business/adventures" },
    { name: "Messages", icon: Users2, href: "/business/messages" },
    { name: "Calendar", icon: Calendar, href: "/business/calendar" },
    { name: "Clients", icon: Users, href: "/business/clients" },
  ]

  const financeItems = [
    { name: "Sales & Payments", icon: DollarSign, href: "/business/sales" },
    { name: "Integrations", icon: Globe, href: "/business/integrations" },
  ]

  const workspaceItems = [
    { name: "Account", icon: Users, href: "/business/account" },
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
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Anchor className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Business</h2>
              <h3 className="text-lg font-bold text-gray-900">Dashboard</h3>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 flex-1 overflow-y-auto">
          {/* Home Button - Special styling to match screenshot */}
          <div className="mb-8">
            <Link
              href="/business/home"
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full
                ${(pathname === '/business/home' || pathname === '/business/dashboard') 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
              `}
              onClick={onClose}
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>
          </div>

          {/* Client Management Section */}
          <div className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Client Management
            </h3>
            <div className="space-y-1">
              {clientManagementItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${item.href === pathname ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Finance Section */}
          <div className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Finance
            </h3>
            <div className="space-y-1">
              {financeItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${item.href === pathname ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Workspace Section */}
          <div className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Workspace
            </h3>
            <div className="space-y-1">
              {workspaceItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${item.href === pathname ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-auto pt-6 border-t border-gray-200 space-y-1">
            <Link
              href="/business/adventures/new"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={onClose}
            >
              <Plus className="mr-3 h-5 w-5" />
              Add New Adventure
            </Link>
            <Link
              href="/"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={onClose}
            >
              <Eye className="mr-3 h-5 w-5" />
              View Customer Site
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                {businessProfile?.business_name || businessProfile?.contact_name || businessProfile?.name || "Business"}
              </p>
              <p className="text-xs text-gray-500">
                {businessProfile?.business_type || "Adventure Business"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}