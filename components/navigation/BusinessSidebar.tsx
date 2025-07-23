
"use client"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  Users,
  DollarSign,
  BookOpen,
  Users2,
  Globe,
  Settings,
  Plus,
  Eye,
  LogOut,
  Anchor,
  Building2,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

interface BusinessSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function BusinessSidebar({ isOpen, onClose }: BusinessSidebarProps) {
  const { businessProfile, signOut } = useAuth()
  const pathname = usePathname()

  // Navigation items configuration
  const navigationSections = [
    {
      title: "Client Management",
      items: [
        { name: "Bookings", icon: Users, href: "/business/bookings", badge: null },
        { name: "Adventures", icon: Anchor, href: "/business/adventures", badge: null },
        { name: "Messages", icon: Users2, href: "/business/messages", badge: "3" },
        { name: "Calendar", icon: Calendar, href: "/business/calendar", badge: null },
        { name: "Clients", icon: Users, href: "/business/clients", badge: null },
      ]
    },
    {
      title: "Finance",
      items: [
        { name: "Sales & Payments", icon: DollarSign, href: "/business/sales", badge: null },
        { name: "Integrations", icon: Globe, href: "/business/integrations", badge: null },
      ]
    },
    {
      title: "Workspace",
      items: [
        { name: "Account", icon: Users, href: "/business/account", badge: null },
        { name: "Settings", icon: Settings, href: "/business/settings", badge: null },
      ]
    }
  ]

  const isActiveLink = (href: string) => {
    return pathname === href || (href === '/business/home' && pathname === '/business/dashboard')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Anchor className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Business</h2>
            <h3 className="text-sm font-bold text-gray-900">Dashboard</h3>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Home Button */}
        <div className="mb-8">
          <Link
            href="/business/home"
            className={`
              flex items-center px-4 py-3 text-sm font-medium rounded-xl w-full transition-all duration-200
              ${isActiveLink('/business/home')
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"}
            `}
            onClick={onClose}
          >
            <Home className="mr-3 h-5 w-5" />
            Home
          </Link>
        </div>

        {/* Navigation Sections */}
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActiveLink(item.href) 
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                  onClick={onClose}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
            {sectionIndex < navigationSections.length - 1 && (
              <Separator className="mt-6" />
            )}
          </div>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-t bg-gray-50">
        <div className="space-y-2">
          <Link
            href="/business/adventures/new"
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-200"
            onClick={onClose}
          >
            <Plus className="mr-3 h-4 w-4" />
            Add New Adventure
          </Link>
          <Link
            href="/"
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-white hover:text-green-600 hover:shadow-sm transition-all duration-200"
            onClick={onClose}
          >
            <Eye className="mr-3 h-4 w-4" />
            View Customer Site
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-red-600"
            onClick={() => {
              signOut()
              onClose()
            }}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Business Profile Footer */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {businessProfile?.business_name || businessProfile?.contact_name || businessProfile?.name || "Business"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {businessProfile?.business_type || "Adventure Business"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-white lg:shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
