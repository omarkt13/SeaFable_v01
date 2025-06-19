"use client"

import { useAuth } from "@/lib/auth-context"
import { signOutAndRedirect } from "@/lib/auth-utils"
import Link from "next/link"
import { Building, BarChart3, Calendar, Users, Settings, LogOut, DollarSign, Star, Plus } from "lucide-react"

export function BusinessNavigation() {
  const { user, isLoading } = useAuth() // Use useAuth to get user and loading state
  const businessProfile = user?.businessProfile // Access businessProfile from the user object

  const handleSignOut = async () => {
    await signOutAndRedirect("business")
  }

  if (isLoading) {
    return null // Or a loading spinner if preferred
  }

  return (
    <nav className="bg-slate-900 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/business/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SeaFable Business</span>
            </Link>
          </div>

          {/* Business Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/business/dashboard"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/business/experiences"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Star className="w-4 h-4" />
              <span>Experiences</span>
            </Link>
            <Link
              href="/business/bookings"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Bookings</span>
            </Link>
            <Link
              href="/business/earnings"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span>Earnings</span>
            </Link>
            <Link
              href="/business/team"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Team</span>
            </Link>
          </div>

          {/* Business Actions & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Link
              href="/business/experiences/new"
              className="bg-teal-500 text-white px-3 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:block">New Experience</span>
            </Link>

            {/* Business Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{businessProfile?.companyName?.charAt(0) || "B"}</span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-white">
                    {businessProfile?.companyName || user?.firstName}
                  </div>
                  <div className="text-xs text-gray-400">{user?.hostProfile?.hostType || "Business"}</div>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {businessProfile?.companyName || user?.firstName}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>

                <Link
                  href="/business/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Business Settings
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <Link href="/" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Users className="w-4 h-4 mr-2" />
                  View Customer Site
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
