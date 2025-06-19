"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Award, Ship } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context" // Import useAuth
import { getHostDashboardData, type BusinessDashboardData } from "@/lib/database"

import { StatsOverview } from "@/components/dashboard/business/stats-overview"
import { RecentBookings } from "@/components/dashboard/business/recent-bookings"
import { UpcomingBookings } from "@/components/dashboard/business/upcoming-bookings"
import { QuickActions } from "@/components/dashboard/business/quick-actions"
import { EarningsSummary } from "@/components/dashboard/business/earnings-summary"
import { PerformanceMetrics } from "@/components/dashboard/business/performance-metrics"
import { ExperiencePerformance } from "@/components/dashboard/business/experience-performance"
import { RecentActivity } from "@/components/dashboard/business/recent-activity"
import { QuickStatsFooter } from "@/components/dashboard/business/quick-stats-footer"

export default function BusinessDashboardPage() {
  const router = useRouter()
  const { user, userType, isLoading } = useAuth() // Use the auth context
  const [dashboardData, setDashboardData] = useState<BusinessDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true) // Separate loading state for data fetching

  useEffect(() => {
    console.log(
      "Dashboard: useEffect triggered. AuthContext state - isLoading:",
      isLoading,
      "userType:",
      userType,
      "user:",
      user?.id,
    )

    if (isLoading) {
      // AuthContext is still determining the user's state. Wait.
      console.log("Dashboard: AuthContext still loading. Waiting...")
      return
    }

    // AuthContext has finished loading. Now check user status.
    if (!user || userType !== "business") {
      console.log("Dashboard: AuthContext determined: Not a business user or no user. Redirecting to login.")
      router.push("/business/login")
      return
    }

    // If we are here, user is a confirmed business user and auth state is loaded
    console.log("Dashboard: User is a business user. Fetching dashboard data.")
    setDataLoading(true)
    setError(null)
    try {
      const result = getHostDashboardData(user.id) // This should be awaited
      result
        .then((dataResult) => {
          if (dataResult.success && dataResult.data) {
            setDashboardData(dataResult.data)
            console.log("Dashboard: Data fetched successfully.")
          } else {
            setError(dataResult.error || "Failed to load dashboard data.")
            console.error("Dashboard: Failed to load data:", dataResult.error)
          }
        })
        .catch((err) => {
          console.error("Dashboard: Error fetching dashboard data:", err)
          setError("An unexpected error occurred while fetching dashboard data.")
        })
        .finally(() => {
          setDataLoading(false)
          console.log("Dashboard: Data fetching complete.")
        })
    } catch (err) {
      console.error("Dashboard: Synchronous error during data fetch initiation:", err)
      setError("An unexpected error occurred during data fetch initiation.")
      setDataLoading(false)
    }
  }, [isLoading, user, userType, router]) // Depend on auth context states

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{isLoading ? "Authenticating..." : "Loading your business dashboard..."}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error loading dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    // This case should ideally be covered by error or loading, but as a fallback
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-600 mb-4">No dashboard data available</h2>
          <p className="text-gray-600">Please contact support if this issue persists.</p>
        </div>
      </div>
    )
  }

  const {
    businessProfile,
    overview,
    recentBookings,
    upcomingBookings,
    earnings,
    analytics,
    experiences,
    recentActivity,
  } = dashboardData

  return (
    <div className="p-6">
      {/* Welcome banner */}
      <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Good morning, {businessProfile?.name || user?.user_metadata?.business_name || "Host"}! 🌊
              </h2>
              <p className="text-blue-100 mb-4">
                You have {upcomingBookings.length} upcoming bookings today. Weather conditions are perfect for water
                activities!
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Profile Complete
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  Verified Business
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Ship className="h-20 w-20 text-blue-300 opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <StatsOverview overview={overview} />

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions businessProfile={businessProfile} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Analytics & Widgets */}
        <div className="lg:col-span-1 space-y-8">
          <UpcomingBookings upcomingBookings={upcomingBookings} />
          <EarningsSummary earnings={earnings} />
          <PerformanceMetrics analytics={analytics} />
          <RecentActivity recentActivity={recentActivity} />
        </div>

        {/* Right column - Bookings & Experiences */}
        <div className="lg:col-span-2 space-y-8">
          <RecentBookings recentBookings={recentBookings} />
          <ExperiencePerformance experiences={experiences} />
        </div>
      </div>

      {/* Quick Stats Footer */}
      <QuickStatsFooter overview={overview} />
    </div>
  )
}
