"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { useAuth } from "@/lib/auth-context"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"

// Import business dashboard components
import {
  StatsOverview,
  RecentBookings,
  UpcomingBookings,
  QuickActions,
  PerformanceMetrics
} from "@/components/dashboard/business"

export default function BusinessHomePage() {
  const { user, businessProfile } = useAuth()

  return (
    <BusinessProtectedRoute>
      <BusinessLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {businessProfile?.contact_name || businessProfile?.name || 'Business Owner'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your business today
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentBookings />
            <UpcomingBookings />
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuickActions />
            <div className="lg:col-span-2">
              <PerformanceMetrics />
            </div>
          </div>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}