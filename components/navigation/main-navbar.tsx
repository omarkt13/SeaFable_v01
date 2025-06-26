"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { Search, Menu, X, LogOut, Settings, Building2, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { signOutAndRedirect } from "@/lib/auth-utils"

export function MainNavbar() {
  const { user, userProfile, businessProfile, userType, isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = useCallback(async () => {
    try {
      await signOutAndRedirect(userType || "customer")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }, [userType])

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Memoize computed values to prevent unnecessary re-calculations
  const userDisplayData = useMemo(() => {
    if (!user) {
      return {
        dashboardLink: "/",
        displayInitials: "U",
        avatarSrc: "/placeholder.svg",
        dropdownInitials: "U"
      }
    }

    let dashboardLink = "/"
    let displayInitials = "U"
    let avatarSrc = "/placeholder.svg"
    let dropdownInitials = "U"

    if (userType === "customer") {
      dashboardLink = "/dashboard"
      if (userProfile?.first_name && userProfile?.last_name) {
        displayInitials = userProfile.first_name.charAt(0) + userProfile.last_name.charAt(0)
        dropdownInitials = displayInitials
      } else if (user?.email) {
        displayInitials = user.email.charAt(0).toUpperCase()
        dropdownInitials = displayInitials
      }
      avatarSrc = userProfile?.avatar_url || "/placeholder.svg"
    } else if (userType === "business") {
      dashboardLink = "/business/home"
      if (businessProfile?.business_name) {
        const businessNameParts = businessProfile.business_name.split(" ")
        if (businessNameParts.length > 1) {
          displayInitials = businessNameParts[0].charAt(0) + businessNameParts[1].charAt(0)
        } else {
          displayInitials = businessNameParts[0].charAt(0)
        }
        dropdownInitials = displayInitials
      } else if (user?.email) {
        displayInitials = user.email.charAt(0).toUpperCase()
        dropdownInitials = displayInitials
      }
      avatarSrc = businessProfile?.logo_url || "/placeholder.svg"
    } else if (user?.email) {
      // Fallback when user exists but userType is not determined yet
      displayInitials = user.email.charAt(0).toUpperCase()
      dropdownInitials = displayInitials
    }

    return {
      dashboardLink,
      displayInitials,
      avatarSrc,
      dropdownInitials
    }
  }, [user, userProfile, businessProfile, userType])

  // Memoize the auth section to prevent unnecessary re-renders
  const authSection = useMemo(() => {
    if (isLoading) {
      return (
        <div className="hidden md:flex items-center space-x-6">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/search"
            className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Explore</span>
          </Link>
          <Link href="/business/login" className="text-gray-700 hover:text-teal-600 transition-colors">
            Business
          </Link>
          <Button asChild className="bg-teal-600 text-white hover:bg-teal-700">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="hidden md:flex items-center space-x-6">
        <Link
          href="/search"
          className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Explore</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-md">
              <Avatar className="w-8 h-8 border-2 border-teal-600">
                <AvatarImage src={userDisplayData.avatarSrc} alt="User Avatar" />
                <AvatarFallback className="bg-teal-100 text-teal-800 font-semibold">
                  {userDisplayData.displayInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block font-medium">Dashboard</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem asChild>
              <Link
                href={userDisplayData.dashboardLink}
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
      </div>
    )
  }, [isLoading, user, userType, userDisplayData, handleSignOut])

  // Memoize mobile menu content
  const mobileMenuContent = useMemo(() => {
    if (!isMobileMenuOpen) return null

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col md:hidden">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SeaFable</span>
          </div>
          <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col p-4 space-y-2">
          <Link
            href="/search"
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={closeMobileMenu}
          >
            <Search className="w-4 h-4" />
            <span>Explore</span>
          </Link>
          {!user && (
            <>
              <Link
                href="/business/login"
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={closeMobileMenu}
              >
                Business
              </Link>
              <Link
                href="/login"
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
            </>
          )}
          {user && (
            <>
              <Link
                href={userDisplayData.dashboardLink}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={closeMobileMenu}
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
                  onClick={closeMobileMenu}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </Link>
              )}
              {userType === "business" && (
                <Link
                  href="/business/settings"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={closeMobileMenu}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Business Settings
                </Link>
              )}
              <button
                onClick={() => {
                  handleSignOut()
                  closeMobileMenu()
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
    )
  }, [isMobileMenuOpen, user, userType, userDisplayData, handleSignOut, closeMobileMenu])

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

        {/* Desktop Navigation */}
        {authSection}

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="md:hidden text-gray-700"
          size="icon"
          onClick={handleMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuContent}
    </nav>
  )
}
