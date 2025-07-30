
"use client"

import { useAuth } from "@/lib/auth-context"
import { signOutAndRedirect } from "@/lib/auth-utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navigation = [
  { name: 'Dashboard', href: '/business/home', icon: Home },
  { name: 'Adventures', href: '/business/adventures', icon: MapPin },
  { name: 'Bookings', href: '/business/bookings', icon: Calendar },
  { name: 'Calendar', href: '/business/calendar', icon: Calendar },
  { name: 'Reports', href: '/business/reports', icon: TrendingUp },
  { name: 'Settings', href: '/business/settings', icon: Settings },
]

export function BusinessNavigation() {
  const { user, businessProfile } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOutAndRedirect("business")
  }

  const userInitials = businessProfile?.contact_name?.split(' ').map(n => n[0]).join('') || 
                      businessProfile?.name?.charAt(0) || 
                      user?.email?.charAt(0) || "B"

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/business/home" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SF</span>
                </div>
                <span className="text-xl font-bold text-gray-900">SeaFable Business</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-100 text-teal-700'
                        : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={businessProfile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{businessProfile?.name || businessProfile?.contact_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/business/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Business Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button onClick={handleSignOut} className="flex items-center w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 lg:hidden relative">
        <div className="px-4 sm:px-6 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/business/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="text-lg font-bold text-gray-900">SeaFable</span>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div 
              className="fixed top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[9999] min-h-[200px]"
              style={{ 
                position: 'fixed',
                top: '64px',
                left: '0',
                right: '0',
                backgroundColor: 'white',
                zIndex: 99999,
                minHeight: '200px'
              }}
            >
              <div className="p-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-100 text-teal-700'
                          : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                
                <div className="border-t border-gray-200 pt-4 mt-4 pb-4">
                  <div className="flex items-center px-3 py-2">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={businessProfile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {businessProfile?.name || businessProfile?.contact_name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    href="/business/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
