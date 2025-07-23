
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
  BarChart,
  Settings,
  Plus,
  Eye,
  LogOut,
  Anchor,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface BusinessSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = {
  clientManagement: [
    { name: "Bookings", icon: Users, href: "/business/bookings" },
    { name: "Experiences", icon: Anchor, href: "/business/adventures" },
    { name: "Messages", icon: Users2, href: "/business/messages" },
    { name: "Calendar", icon: Calendar, href: "/business/calendar" },
    { name: "Clients", icon: Users, href: "/business/clients" },
  ],
  finance: [
    { name: "Sales & Payments", icon: DollarSign, href: "/business/sales" },
    { name: "Integrations", icon: Globe, href: "/business/integrations" },
  ],
  workspace: [
    { name: "Account", icon: Users, href: "/business/account" },
    { name: "Settings", icon: Settings, href: "/business/settings" },
  ]
}

const quickActions = [
  { name: "Add New Adventure", icon: Plus, href: "/business/adventures/new" },
  { name: "View Customer Site", icon: Eye, href: "/" },
]

function SidebarContent({ onClose }: { onClose: () => void }) {
  const { businessProfile, signOut } = useAuth()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/business/home') {
      return pathname === '/business/home' || pathname === '/business/dashboard'
    }
    return pathname === href
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-6 border-b">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Anchor className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Business</h2>
          <h3 className="text-lg font-bold text-gray-900">Dashboard</h3>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <NavigationMenu orientation="vertical" className="w-full max-w-none">
          <NavigationMenuList className="flex-col space-x-0 space-y-1 w-full">
            {/* Home Button */}
            <NavigationMenuItem className="w-full mb-6">
              <NavigationMenuLink
                asChild
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full transition-colors",
                  isActive('/business/home')
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Link href="/business/home" onClick={onClose}>
                  <Home className="mr-3 h-5 w-5" />
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Client Management */}
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Client Management
              </h3>
              {navigationItems.clientManagement.map((item) => (
                <NavigationMenuItem key={item.name} className="w-full">
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full",
                      isActive(item.href)
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </div>

            {/* Finance */}
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Finance
              </h3>
              {navigationItems.finance.map((item) => (
                <NavigationMenuItem key={item.name} className="w-full">
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full",
                      isActive(item.href)
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </div>

            {/* Workspace */}
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Workspace
              </h3>
              {navigationItems.workspace.map((item) => (
                <NavigationMenuItem key={item.name} className="w-full">
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full",
                      isActive(item.href)
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </div>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Quick Actions */}
        <div className="mt-auto pt-6 border-t border-gray-200 space-y-1">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              onClick={onClose}
            >
              <action.icon className="mr-3 h-5 w-5" />
              {action.name}
            </Link>
          ))}
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
  )
}

export function BusinessSidebar({ isOpen, onClose }: BusinessSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:flex-shrink-0 lg:w-64">
        <div className="bg-white shadow-lg border-r border-gray-200 h-full">
          <SidebarContent onClose={onClose} />
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onClose={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}
