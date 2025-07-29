"use client"

import { useAuth } from "@/lib/auth-context"
import { signOutAndRedirect } from "@/lib/auth-utils"
import Link from "next/link"
import { Search, Calendar, Heart, Settings, LogOut, Menu, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function CustomerNavigation() {
  const { user, userProfile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOutAndRedirect("customer")
  }

  const userInitials =
    (userProfile?.first_name?.charAt(0) || "") + (userProfile?.last_name?.charAt(0) || "") || user?.email?.charAt(0) || "U"

  const navigationItems = [
    { name: 'Find Adventures', href: '/search', icon: Search },
    { name: 'My Adventures', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Wishlist', href: '/dashboard/favorites', icon: Heart },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SF</span>
                </div>
                <span className="text-xl font-bold text-gray-900">SeaFable</span>
              </Link>
            </div>

            {/* Customer Navigation Links - Hide on smaller tablets */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{userProfile?.first_name || user?.email}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  {/* Show navigation items in dropdown for tablets */}
                  <div className="lg:hidden">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link
                            href={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                    <div className="border-t border-gray-200 my-1"></div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Business Account Link */}
              <Button asChild className="bg-teal-600 text-white hover:bg-teal-700 text-xs sm:text-sm px-2 sm:px-4">
                <Link href="/business/login">
                  <span className="hidden sm:inline">Business Login</span>
                  <span className="sm:hidden">Business</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sm:hidden relative overflow-visible">
        <div className="px-3 relative">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">SF</span>
              </div>
              <span className="text-base font-bold text-gray-900">SeaFable</span>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 min-w-[36px] h-9"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[9999] min-h-[200px]">
              <div className="p-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-colors active:bg-gray-100"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center px-3 py-2">
                    <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
                      <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userProfile?.first_name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md active:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span>Profile Settings</span>
                  </Link>

                  <Link
                    href="/business/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md active:bg-gray-100"
                  >
                    <span>Business Login</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md w-full text-left active:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
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