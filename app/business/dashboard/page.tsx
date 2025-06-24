"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Star,
  DollarSign,
  Ship,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  Users,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/auth-utils"

interface DashboardData {
  overview: {
    totalRevenue: number
    activeBookings: number
    totalExperiences: number
    averageRating: number
    revenueGrowth: number
    bookingGrowth: number
  }
  recentBookings: Array<{
    id: string
    customerName: string
    experienceTitle: string
    date: string
    status: string
    amount: number
    guests: number
  }>
  upcomingBookings: Array<{
    id: string
    customerName: string
    experienceTitle: string
    date: string
    time: string
    guests: number
    specialRequests?: string
  }>
  earnings: {
    thisMonth: number
    lastMonth: number
    pending: number
    nextPayout: {
      amount: number
      date: string
    }
  }
  analytics: {
    conversionRate: number
    customerSatisfaction: number
    repeatCustomerRate: number
    marketplaceVsDirectRatio: number
  }
}

export default function BusinessDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, businessProfile, userType, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/business/login")
        return
      }
      if (userType !== "business") {
        router.push("/login")
        return
      }
      if (businessProfile) {
        loadDashboardData()
      }
    }
  }, [user, businessProfile, userType, authLoading, router])

  const loadDashboardData = async () => {
    if (!businessProfile) return

    try {
      setIsLoading(true)
      setError(null)

      console.log("Loading dashboard data for host:", businessProfile.id)

      // Initialize default values
      let totalRevenue = 0
      let activeBookings = 0
      let totalExperiences = 0
      let averageRating = 0
      let recentBookings: any[] = []
      let upcomingBookings: any[] = []

      // Get experiences
      try {
        const { data: experiences, error: expError } = await supabase
          .from("experiences")
          .select("id, title, rating")
          .eq("host_id", businessProfile.id)
          .eq("is_active", true)

        if (!expError && experiences) {
          totalExperiences = experiences.length
          if (experiences.length > 0) {
            const totalRating = experiences.reduce((sum, exp) => sum + (Number(exp.rating) || 0), 0)
            averageRating = totalRating / experiences.length
          }
          console.log("Experiences loaded:", totalExperiences)
        } else {
          console.log("Experiences error:", expError?.message)
        }
      } catch (error) {
        console.error("Error loading experiences:", error)
      }

      // Get bookings
      try {
        const today = new Date().toISOString().split("T")[0]

        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id, 
            total_price, 
            booking_status, 
            booking_date, 
            number_of_guests,
            departure_time,
            special_requests,
            created_at,
            users!bookings_user_id_fkey(first_name, last_name),
            experiences!bookings_experience_id_fkey(title)
          `)
          .eq("host_id", businessProfile.id)

        if (!bookingsError && bookings) {
          console.log("Total bookings found:", bookings.length)

          // Count active bookings (future confirmed/pending)
          activeBookings = bookings.filter(
            (b) => (b.booking_status === "confirmed" || b.booking_status === "pending") && b.booking_date >= today,
          ).length

          // Calculate revenue from confirmed bookings
          const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed")
          totalRevenue = confirmedBookings.reduce((sum, booking) => {
            return sum + (Number(booking.total_price) || 0)
          }, 0)

          // Apply platform fee (approximate net revenue)
          totalRevenue = Math.round(totalRevenue * 0.85) // 15% platform fee

          // Recent bookings
          recentBookings = bookings
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((booking) => ({
              id: booking.id,
              customerName: booking.users
                ? `${booking.users.first_name || "Unknown"} ${booking.users.last_name || "Customer"}`
                : "Unknown Customer",
              experienceTitle: booking.experiences?.title || "Water Activity",
              date: booking.booking_date,
              status: booking.booking_status,
              amount: Number(booking.total_price || 0),
              guests: booking.number_of_guests || 1,
            }))

          // Upcoming bookings
          upcomingBookings = bookings
            .filter((b) => b.booking_status === "confirmed" && b.booking_date >= today)
            .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
            .slice(0, 5)
            .map((booking) => ({
              id: booking.id,
              customerName: booking.users
                ? `${booking.users.first_name || "Unknown"} ${booking.users.last_name || "Customer"}`
                : "Unknown Customer",
              experienceTitle: booking.experiences?.title || "Water Activity",
              date: booking.booking_date,
              time: booking.departure_time || "09:00",
              guests: booking.number_of_guests || 1,
              specialRequests: booking.special_requests,
            }))

          console.log("Active bookings:", activeBookings, "Revenue:", totalRevenue)
        } else {
          console.log("Bookings error:", bookingsError?.message)
        }
      } catch (error) {
        console.error("Error loading bookings:", error)
      }

      // Build dashboard data
      const data: DashboardData = {
        overview: {
          totalRevenue: Math.round(totalRevenue),
          activeBookings,
          totalExperiences,
          averageRating: Math.round(averageRating * 10) / 10,
          revenueGrowth: 12,
          bookingGrowth: 8,
        },
        recentBookings,
        upcomingBookings,
        earnings: {
          thisMonth: Math.round(totalRevenue),
          lastMonth: 0,
          pending: Math.round(totalRevenue * 0.3),
          nextPayout: {
            amount: Math.round(totalRevenue * 0.3),
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
        },
        analytics: {
          conversionRate: 68,
          customerSatisfaction: averageRating,
          repeatCustomerRate: 34,
          marketplaceVsDirectRatio: 60,
        },
      }

      setDashboardData(data)
      console.log("Dashboard data loaded successfully")
    } catch (error) {
      console.error("Error loading dashboard:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled_user":
      case "cancelled_host":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled_user":
      case "cancelled_host":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your business dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => loadDashboardData()}>Try Again</Button>
            <Button variant="outline" onClick={() => router.push("/business/experiences")}>
              Manage Experiences
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {businessProfile?.businessName || businessProfile?.name || "Business Owner"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/business/calendar")}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button onClick={() => router.push("/business/experiences/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New Experience
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{dashboardData.overview.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />+{dashboardData.overview.revenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.activeBookings}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />+{dashboardData.overview.bookingGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experiences Listed</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.totalExperiences}</div>
              <p className="text-xs text-muted-foreground">All active experiences</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.averageRating}</div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= dashboardData.overview.averageRating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bookings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your confirmed bookings for the next few days</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.experienceTitle}</p>
                            <p className="text-sm text-gray-600">
                              {booking.customerName} • {booking.guests} guests
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.date).toLocaleDateString()} at {booking.time}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No upcoming bookings</p>
                    <p className="text-sm text-gray-400 mb-4">Set your availability to start receiving bookings</p>
                    <Button onClick={() => router.push("/business/calendar")}>Set Your Availability</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest customer bookings and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            {getStatusIcon(booking.status)}
                          </div>
                          <div>
                            <p className="font-medium">{booking.experienceTitle}</p>
                            <p className="text-sm text-gray-600">
                              {booking.customerName} • {booking.guests} guests
                            </p>
                            <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{booking.amount}</p>
                          <Badge className={getStatusColor(booking.status)}>{booking.status.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No bookings yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Create your first experience to start receiving bookings
                    </p>
                    <Button onClick={() => router.push("/business/experiences/new")}>Create Experience</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analytics & Earnings */}
          <div className="space-y-6">
            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings</CardTitle>
                <CardDescription>Your financial overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">This Month</span>
                  <span className="text-lg font-bold">€{dashboardData.earnings.thisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Payout</span>
                  <span className="text-sm text-yellow-600">€{dashboardData.earnings.pending.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">Next Payout</div>
                  <div className="text-lg font-semibold">
                    €{dashboardData.earnings.nextPayout.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(dashboardData.earnings.nextPayout.date).toLocaleDateString()}
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => router.push("/business/earnings")}>
                  View Financial Details
                </Button>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Key business metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Booking Conversion</span>
                    <span className="text-sm text-green-600">{dashboardData.analytics.conversionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${dashboardData.analytics.conversionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-blue-600">{dashboardData.analytics.customerSatisfaction}/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(dashboardData.analytics.customerSatisfaction / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Repeat Customers</span>
                    <span className="text-sm text-purple-600">{dashboardData.analytics.repeatCustomerRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${dashboardData.analytics.repeatCustomerRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/business/experiences")}
                >
                  <Ship className="h-4 w-4 mr-2" />
                  Manage Experiences
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/business/team")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team Management
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/business/settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Business Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
