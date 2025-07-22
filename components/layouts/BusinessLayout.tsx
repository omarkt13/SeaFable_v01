'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  TrendingUp, 
  MapPin,
  Menu,
  X,
  Bell,
  Search,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useResponsive, getResponsiveClasses } from '@/hooks/use-responsive'

const navigation = [
  { name: 'Home', href: '/business/home', icon: Home },
  { name: 'Adventures', href: '/business/adventures', icon: MapPin },
  { name: 'Bookings', href: '/business/bookings', icon: Calendar },
  { name: 'Calendar', href: '/business/calendar', icon: Calendar },
  { name: 'Reports', href: '/business/reports', icon: TrendingUp },
  { name: 'Settings', href: '/business/settings', icon: Settings },
]

interface BusinessLayoutProps {
  children: React.ReactNode
}

export function BusinessLayout({ children }: BusinessLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { isMobile, isTablet, screenSize } = useResponsive()
  const classes = getResponsiveClasses(screenSize)

  const getSidebarWidth = () => {
    if (isMobile) return 'w-80'
    if (isTablet) return 'w-64'
    return 'w-64'
  }

  const getTopBarHeight = () => {
    if (isMobile) return 'h-14'
    if (isTablet) return 'h-16'
    return 'h-16'
  }

  const getIconSize = () => {
    if (isMobile) return 'h-5 w-5'
    if (isTablet) return 'h-5 w-5'
    return 'h-6 w-6'
  }

  const getNavTextSize = () => {
    if (isMobile) return 'text-base'
    return 'text-sm'
  }

  const getNavPadding = () => {
    if (isMobile) return 'px-3 py-3'
    return 'px-2 py-2'
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile/Tablet sidebar overlay */}
      {sidebarOpen && (isMobile || isTablet) && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className={`relative flex ${getSidebarWidth()} flex-1 flex-col bg-white shadow-2xl`}>
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <div className="flex shrink-0 items-center px-4">
                <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  SeaFable {!isMobile && 'Business'}
                </h1>
              </div>
              <nav className="mt-5 space-y-1 px-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md ${getNavPadding()} ${getNavTextSize()} font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={`mr-3 shrink-0 ${getIconSize()}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-1 flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">SeaFable Business</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-6 w-6 shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        {/* Top navigation */}
        <div className={`sticky top-0 z-10 flex shrink-0 bg-white shadow border-b border-gray-200 ${getTopBarHeight()}`}>
          <div className="flex w-full">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className={getIconSize()} />
            </button>

            <div className="flex flex-1 justify-between px-3 sm:px-4 lg:px-6">
              {/* Search - Hidden on mobile, shown on tablet and desktop */}
              {!isMobile && (
                <div className="flex flex-1 max-w-md">
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                      <Search className="h-4 w-4 ml-3" />
                    </div>
                    <input
                      className="block h-full w-full border-transparent py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </div>
              )}

              <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                {isMobile && (
                  <button className="rounded-full bg-white p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <Search className="h-5 w-5" />
                  </button>
                )}
                <button className="rounded-full bg-white p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <Bell className={isMobile ? 'h-5 w-5' : 'h-6 w-6'} />
                </button>
                <div className="relative">
                  <Avatar className={isMobile ? 'h-8 w-8' : 'h-9 w-9'}>
                    <AvatarFallback>
                      <User className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className={classes.container}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default BusinessLayout