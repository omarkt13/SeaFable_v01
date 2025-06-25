"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X, LogOut, Settings, Building2, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { signOutAndRedirect } from "@/lib/auth-utils"

export function MainNavbar() {
  const { user, userProfile, businessProfile, userType } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOutAndRedirect(userType || "customer") // Use current userType for redirect
  }

  let dashboardLink = "/"
  let displayInitials = "U"
  let avatarSrc = "/placeholder.svg"

  if (user) {
    if (userType === "customer") {
      dashboardLink = "/dashboard"
      displayInitials =
        userProfile?.first_name?.charAt(0) + userProfile?.last_name?.charAt(0) || user?.email?.charAt(0) || "U"
      avatarSrc = userProfile?.avatar_url || "/placeholder.svg"
    } else if (userType === "business") {
      dashboardLink = "/business/home"
      const businessNameParts = businessProfile?.business_name?.split(" ")
      if (businessNameParts && businessNameParts.length > 1) {
        displayInitials = businessNameParts[0].charAt(0) + businessNameParts[1].charAt(0)
      } else if (businessNameParts && businessNameParts.length === 1) {
        displayInitials = businessNameParts[0].charAt(0)
      } else {
        displayInitials = user?.email?.charAt(0) || "B"
      }
      avatarSrc = businessProfile?.logo_url || "/placeholder.svg"
    }
  }

  // Fallback for dropdown initials if userProfile is not fully loaded yet
  let dropdownInitials = "U"
  if (userProfile?.first_name && userProfile?.last_name) {
    dropdownInitials = userProfile.first_name.charAt(0) + userProfile.last_name.charAt(0)
  } else if (user?.email) {
    dropdownInitials = user.email.charAt(0).toUpperCase()
  } else if (businessProfile?.business_name) {
    dropdownInitials = businessProfile.business_name.charAt(0).toUpperCase()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SeaFable</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/search"
            className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Explore</span>
          </Link>

          {!user && (
            <>
              <Link href="/business/login" className="text-gray-700 hover:text-teal-600 transition-colors">
                Business
              </Link>
              <Button asChild className="bg-teal-600 text-white hover:bg-teal-700">
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors">
                  <Avatar className="w-8 h-8 border-2 border-teal-600">
                    <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="User Avatar" />
                    <AvatarFallback className="bg-teal-100 text-teal-800 font-semibold">
                      {displayInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block font-medium">Dashboard</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={dashboardLink}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {userType === "customer" ? (
                      <User2 className="w-4 h-4 mr-2" />
                    ) : (
                      <Building2 className="w-4 h-4 mr-2" />
                    )}
                    {userType === "customer" ? "My Dashboard" : "Business Dashboard"}
                  </Link>
                </DropdownMenuItem>
                {userType === "customer" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                )}
                {userType === "business" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/business/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Business Settings
                    </Link>
                  </DropdownMenuItem>
                )}
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
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="md:hidden text-gray-700"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col md:hidden">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SeaFable</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex flex-col p-4 space-y-2">
            <Link
              href="/search"
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </Link>
            {!user && (
              <>
                <Link
                  href="/business/login"
                  className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Business
                </Link>
                <Link
                  href="/login"
                  className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
            {user && (
              <>
                <Link
                  href={dashboardLink}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {userType === "customer" ? (
                    <User2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Building2 className="w-4 h-4 mr-2" />
                  )}
                  {userType === "customer" ? "My Dashboard" : "Business Dashboard"}
                </Link>
                {userType === "customer" && (
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                )}
                {userType === "business" && (
                  <Link
                    href="/business/settings"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Business Settings
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
