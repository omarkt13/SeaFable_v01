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
  Phone,
  Bell,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/auth-utils" // Assuming this is the client-side supabase instance
import { BusinessLayout } from "@/components/layouts/BusinessLayout"

interface DashboardData {
  overview: {
    totalRevenue: number
    activeBookings: number
    totalExperiences: number
    averageRating: number
    revenueGrowth: number
    bookingGrowth: number
    bookingsMade: number // New: Total bookings made
    paymentsReceived: number // New: Total payments received
    bookingsFulfilled: number // New: Total bookings fulfilled
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
    phone?: string
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
  notifications: Array<{
    id: string
    message: string
    type: "info" | "warning" | "success" | "error"
    timestamp: string
  }>
}

export default function BusinessHomePage() {
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
      let bookingsMade = 0
      let paymentsReceived = 0
      let bookingsFulfilled = 0
      let recentBookings: any[] = []
      let upcomingBookings: any[] = []
      let notifications: any[] = []

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
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

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
            booked_at,
            payment_status,
            users!bookings_user_id_fkey(first_name, last_name),
            experiences!bookings_experience_id_fkey(title)
          `)
          .eq("host_id", businessProfile.id)

        if (!bookingsError && bookings) {
          console.log("Total bookings found:", bookings.length)

          // Monthly Stats
          const currentMonthBookings = bookings.filter((b) => b.booked_at >= startOfMonth && b.booked_at <= today)
          bookingsMade = currentMonthBookings.length
          paymentsReceived = currentMonthBookings
            .filter((b) => b.payment_status === "paid" || b.payment_status === "completed")
            .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
          bookingsFulfilled = currentMonthBookings.filter((b) => b.booking_status === "completed").length

          // Active bookings (future confirmed/pending)
          activeBookings = bookings.filter(
            (b) => (b.booking_status === "confirmed" || b.booking_status === "pending") && b.booking_date >= today,
          ).length

          // Calculate total revenue from all confirmed bookings (for overall earnings)
          totalRevenue = bookings
            .filter((b) => b.booking_status === "confirmed")
            .reduce((sum, booking) => {
              return sum + (Number(booking.total_price) || 0)
            }, 0)

          // Apply platform fee (approximate net revenue)
          totalRevenue = Math.round(totalRevenue * 0.85) // 15% platform fee

          // Recent bookings
          recentBookings = bookings
            .sort((a, b) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime())
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
              phone: undefined,
            }))

          console.log("Active bookings:", activeBookings, "Revenue:", totalRevenue, "Fulfilled:", bookingsFulfilled)
        } else {
          console.log("Bookings error:", bookingsError?.message)
        }
      } catch (error) {
        console.error("Error loading bookings:", error)
      }

      // Placeholder Notifications
      notifications = [
        {
          id: "1",
          message: "New booking confirmed for 'Sunset Kayak Tour' on 2024-07-15.",
          type: "success",
          timestamp: "2 hours ago",
        },
        {
          id: "2",
          message: "Your 'Diving Expedition' experience is low on availability for next week.",
          type: "warning",
          timestamp: "1 day ago",
        },
        { id: "3", message: "Payment received for booking #12345.", type: "info", timestamp: "3 days ago" },
        {
          id: "4",
          message: "Review your business settings for optimal performance.",
          type: "info",
          timestamp: "5 days ago",
        },
      ]

      // Build dashboard data
      const data: DashboardData = {
        overview: {
          totalRevenue: Math.round(totalRevenue),
          activeBookings,
          totalExperiences,
          averageRating: Math.round(averageRating * 10) / 10,
          revenueGrowth: 12, // Placeholder
          bookingGrowth: 8, // Placeholder
          bookingsMade,
          paymentsReceived: Math.round(paymentsReceived),
          bookingsFulfilled,
        },
        recentBookings,
        upcomingBookings,
        earnings: {
          thisMonth: Math.round(paymentsReceived), // Use paymentsReceived for thisMonth earnings
          lastMonth: 0, // Placeholder
          pending: Math.round(totalRevenue * 0.3), // Placeholder
          nextPayout: {
            amount: Math.round(totalRevenue * 0.3), // Placeholder
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
        },
        analytics: {
          conversionRate: 68, // Placeholder
          customerSatisfaction: averageRating,
          repeatCustomerRate: 34, // Placeholder
          marketplaceVsDirectRatio: 60, // Placeholder
        },
        notifications,
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
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
    <BusinessLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Home</h1>
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

          {/* Monthly Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Bookings Made (This Month)</CardTitle>
                <Calendar className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900">{dashboardData.overview.bookingsMade}</div>
                <p className="text-sm text-gray-500 mt-1">Total new bookings this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Payments Received (This Month)</CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900">
                  €{dashboardData.overview.paymentsReceived.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">Total payments processed this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Bookings Fulfilled (This Month)</CardTitle>
                <CheckCircle className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900">{dashboardData.overview.bookingsFulfilled}</div>
                <p className="text-sm text-gray-500 mt-1">Experiences completed this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Average Rating</CardTitle>
                <Star className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900">{dashboardData.overview.averageRating}</div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= dashboardData.overview.averageRating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Bookings & Calendar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <CardDescription>Your confirmed bookings for the next few days</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {dashboardData.upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.upcomingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg shadow-sm"
                        >
                          <div className="flex items-start space-x-4 mb-3 sm:mb-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-base">{booking.experienceTitle}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {booking.customerName} • {booking.guests} guests
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(booking.date).toLocaleDateString()} at {booking.time}
                              </p>
                              {booking.phone && booking.phone !== "N/A" && (
                                <a
                                  href={`tel:${booking.phone}`}
                                  className="text-xs text-blue-500 flex items-center mt-1 hover:underline"
                                >
                                  <Phone className="h-3 w-3 mr-1" /> {booking.phone}
                                </a>
                              )}
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
                      <Calendar className="h-14 w-14 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No upcoming bookings</p>
                      <p className="text-sm text-gray-400 mb-6">Set your availability to start receiving bookings.</p>
                      <Button onClick={() => router.push("/business/experiences")}>Set Your Availability</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Calendar</CardTitle>
                  <CardDescription>Overview of your schedule for the current week</CardDescription>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-14 w-14 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Your weekly schedule at a glance.</p>
                  <p className="text-sm text-gray-400 mb-6">
                    Click below to manage your full calendar and availability.
                  </p>
                  <Button onClick={() => router.push("/business/calendar")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest customer bookings and their status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {dashboardData.recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border rounded-lg shadow-sm"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {getStatusIcon(booking.status)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-base">{booking.experienceTitle}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {booking.customerName} • {booking.guests} guests
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(booking.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-base">€{booking.amount}</p>
                            <Badge className={`${getStatusColor(booking.status)} capitalize mt-1`}>
                              {booking.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Ship className="h-14 w-14 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
                      <p className="text-sm text-gray-400 mb-6">
                        Create your first experience to start receiving bookings.
                      </p>
                      <Button onClick={() => router.push("/business/experiences/new")}>Create Experience</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Payments, Notifications & Quick Actions */}
            <div className="space-y-6">
              {/* Upcoming Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <CardDescription>Summary of your next payout</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-700">Pending Payout</span>
                    <span className="text-xl font-bold text-yellow-600">
                      €{dashboardData.earnings.pending.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Next Payout Date</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(dashboardData.earnings.nextPayout.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Amount: €{dashboardData.earnings.nextPayout.amount.toLocaleString()}
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => router.push("/business/earnings")}>
                    View Financial Details
                  </Button>
                </CardContent>
              </Card>

              {/* Key Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Notifications</CardTitle>
                  <CardDescription>Important alerts and announcements</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {dashboardData.notifications.length > 0 ? (
                    dashboardData.notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-4">
                        <div className="pt-1 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Bell className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-base">No new notifications.</p>
                      <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start py-2.5"
                    onClick={() => router.push("/business/experiences")}
                  >
                    <Ship className="h-4 w-4 mr-2 text-gray-600" />
                    Manage Experiences
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start py-2.5"
                    onClick={() => router.push("/business/calendar")}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                    Manage Availability
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start py-2.5"
                    onClick={() => router.push("/business/team")}
                  >
                    <Users className="h-4 w-4 mr-2 text-gray-600" />
                    Team Management
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start py-2.5"
                    onClick={() => router.push("/business/settings")}
                  >
                    <Settings className="h-4 w-4 mr-2 text-gray-600" />
                    Business Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </BusinessLayout>
  )
}
