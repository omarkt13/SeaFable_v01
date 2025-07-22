
"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { useAuth } from "@/lib/auth-context"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Calendar, Users, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BusinessHomePage() {
  const { user, businessProfile } = useAuth()
  const router = useRouter()

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
              Ready to manage your adventure business?
            </p>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/business/dashboard')}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-gray-900 mb-2">View Dashboard</h3>
                <p className="text-sm text-gray-600">See your business metrics and performance</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/business/adventures')}>
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-gray-900 mb-2">Manage Adventures</h3>
                <p className="text-sm text-gray-600">Create and edit your adventure offerings</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/business/bookings')}>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold text-gray-900 mb-2">View Bookings</h3>
                <p className="text-sm text-gray-600">Manage customer bookings and reservations</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/business/calendar')}>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-orange-600" />
                <h3 className="font-semibold text-gray-900 mb-2">Calendar</h3>
                <p className="text-sm text-gray-600">Manage your availability and schedule</p>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Complete your business profile</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">Add your first adventure offering</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">Set up your availability calendar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">Configure payment settings</span>
                </div>
              </div>
              <Button className="mt-4" onClick={() => router.push('/business/adventures/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Adventure
              </Button>
            </CardContent>
          </Card>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}
