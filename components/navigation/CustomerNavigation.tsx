"use client"

import { useAuth } from "@/lib/auth-context"
import { signOutAndRedirect } from "@/lib/auth-utils"
import Link from "next/link"
import { Search, Calendar, Heart, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function CustomerNavigation() {
  const { user, userProfile, businessProfile, userType } = useAuth()

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
      // For business, use first two letters of business name or first letter of email
      const businessNameParts = businessProfile?.business_name?.split(" ")
      if (businessNameParts && businessNameParts.length > 1) {
        displayInitials = businessNameParts[0].charAt(0) + businessNameParts[1].charAt(0)
      } else if (businessNameParts && businessNameParts.length === 1) {
        displayInitials = businessNameParts[0].charAt(0)
      } else {
        displayInitials = user?.email?.charAt(0) || "B" // Fallback to 'B' for business
      }
      avatarSrc = businessProfile?.logo_url || "/placeholder.svg"
    }
  }

  // Calculate user initials for the dropdown menu
  let userInitials = "U"
  if (userProfile?.first_name && userProfile?.last_name) {
    userInitials = userProfile.first_name.charAt(0) + userProfile.last_name.charAt(0)
  } else if (user?.email) {
    userInitials = user.email.charAt(0).toUpperCase()
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {" "}
              {/* Changed to root for general landing */}
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SeaFable</span>
            </Link>
          </div>

          {/* Customer Navigation Links (visible only if not logged in or is customer) */}
          {(!user || userType === "customer") && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/search"
                className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Explore</span>
              </Link>
              {userType === "customer" && ( // Only show these if actually a customer
                <>
                  <Link
                    href="/dashboard/bookings"
                    className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>My Trips</span>
                  </Link>
                  <Link
                    href="/dashboard/favorites"
                    className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Favorites</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Menu and Dynamic Dashboard Link */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link
                href={dashboardLink}
                className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <Avatar className="w-8 h-8 border-2 border-teal-600">
                  {" "}
                  {/* Distinct border */}
                  <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="User Avatar" />
                  <AvatarFallback className="bg-teal-100 text-teal-800 font-semibold">{displayInitials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block font-medium">Dashboard</span>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">{userProfile?.first_name || user?.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
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

            {/* Business Account Link (visible only if not logged in) */}
            {!user && (
              <div className="hidden md:block">
                <Button asChild className="bg-teal-600 text-white hover:bg-teal-700">
                  <Link href="/business/login">Business Login</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
