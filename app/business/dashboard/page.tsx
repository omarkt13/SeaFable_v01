
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  TrendingUp,
  Users,
  Euro,
  Star,
  MapPin,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus
} from "lucide-react"

// Mock data for dashboard
const dashboardData = {
  stats: {
    totalRevenue: 12450,
    revenueChange: 12.5,
    totalBookings: 87,
    bookingsChange: 8.3,
    totalAdventures: 6,
    adventuresChange: 2.1,
    averageRating: 4.8,
    ratingChange: 0.2
  },
  recentBookings: [
    {
      id: "1",
      customerName: "Sarah Johnson",
      adventure: "Mountain Hiking Adventure",
      date: "2024-01-15",
      time: "09:00",
      guests: 4,
      status: "confirmed",
      revenue: 280
    },
    {
      id: "2",
      customerName: "Mike Chen",
      adventure: "Kayaking Experience",
      date: "2024-01-16",
      time: "14:30",
      guests: 2,
      status: "pending",
      revenue: 160
    },
    {
      id: "3",
      customerName: "Emma Davis",
      adventure: "Rock Climbing Course",
      date: "2024-01-17",
      time: "10:00",
      guests: 1,
      status: "confirmed",
      revenue: 120
    }
  ],
  upcomingBookings: [
    {
      id: "4",
      customerName: "Alex Wilson",
      adventure: "Sunset Photography Tour",
      date: "2024-01-20",
      time: "17:00",
      guests: 3,
      status: "confirmed"
    },
    {
      id: "5",
      customerName: "Lisa Brown",
      adventure: "Wildlife Safari",
      date: "2024-01-21",
      time: "08:00",
      guests: 6,
      status: "confirmed"
    }
  ],
  topAdventures: [
    {
      name: "Mountain Hiking Adventure",
      bookings: 23,
      revenue: 1840,
      rating: 4.9
    },
    {
      name: "Kayaking Experience",
      bookings: 18,
      revenue: 1440,
      rating: 4.7
    },
    {
      name: "Rock Climbing Course",
      bookings: 15,
      revenue: 1800,
      rating: 4.8
    }
  ]
}

export default function BusinessDashboardPage() {
  const { user, businessProfile } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </BusinessLayout>
      </BusinessProtectedRoute>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <BusinessProtectedRoute>
      <BusinessLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {businessProfile?.contact_name || businessProfile?.name || 'Business Owner'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's what's happening with your business today
                </p>
              </div>
              <Button onClick={() => router.push('/business/adventures/new')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Adventure
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">€{dashboardData.stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+{dashboardData.stats.revenueChange}%</span>
                    </div>
                  </div>
                  <Euro className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalBookings}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+{dashboardData.stats.bookingsChange}%</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Adventures</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalAdventures}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+{dashboardData.stats.adventuresChange}%</span>
                    </div>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.averageRating}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+{dashboardData.stats.ratingChange}</span>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Bookings</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push('/business/bookings')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.adventure}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.guests} guests
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{booking.revenue}</p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push('/business/calendar')}>
                    View Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.adventure}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.guests} guests
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Adventures */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performing Adventures</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/business/adventures')}>
                  Manage Adventures
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topAdventures.map((adventure, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{adventure.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {adventure.bookings} bookings
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {adventure.rating}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{adventure.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/business/adventures/new')}>
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-gray-900 mb-2">Create Adventure</h3>
                <p className="text-sm text-gray-600">Add a new adventure offering</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/business/calendar')}>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-gray-900 mb-2">Manage Calendar</h3>
                <p className="text-sm text-gray-600">Set availability and schedules</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/business/reports')}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold text-gray-900 mb-2">View Reports</h3>
                <p className="text-sm text-gray-600">Analyze business performance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}
