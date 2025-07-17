"use client"

import { useAuth } from "@/lib/auth-context"
import { signOutAndRedirect } from "@/lib/auth-utils"
import Link from "next/link"
import { Search, Calendar, Heart, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function CustomerNavigation() {
  const { user, userProfile } = useAuth()

  const handleSignOut = async () => {
    await signOutAndRedirect("customer")
  }

  const userInitials =
    userProfile?.first_name?.charAt(0) + userProfile?.last_name?.charAt(0) || user?.email?.charAt(0) || "U"

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
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

          {/* Customer Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/search"
              className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Find Adventures</span>
            </Link>
            <Link
              href="/dashboard/bookings"
              className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>My Adventures</span>
            </Link>
            <Link
              href="/dashboard/favorites"
              className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </Link>
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
                  <span className="hidden md:block">{userProfile?.first_name || user?.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
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
            <div className="hidden md:block">
              <Button asChild className="bg-teal-600 text-white hover:bg-teal-700">
                <Link href="/business/login">Business Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
