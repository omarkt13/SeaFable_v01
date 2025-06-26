"use client"

import Link from "next/link"

import { redirect } from "next/navigation"
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
import { getBusinessProfile, getHostExperiences, getHostBookings } from "@/lib/supabase-business"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

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

export default async function BusinessHomePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/business/login")
  }

  let businessProfile = null
  try {
    businessProfile = await getBusinessProfile(user.id)
    if (!businessProfile) {
      redirect("/business/onboarding") // Redirect if no business profile
    }
  } catch (error) {
    console.error("Error fetching business profile:", error)
    redirect("/business/login") // Or an error page
  }

  let dashboardData: DashboardData | null = null
  let error: string | null = null

  try {
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
    const experiences = await getHostExperiences(businessProfile.id)
    if (experiences) {
      totalExperiences = experiences.length
      if (experiences.length > 0) {
        const totalRating = experiences.reduce((sum, exp) => sum + (Number(exp.rating) || 0), 0)
        averageRating = totalRating / experiences.length
      }
    }

    // Get bookings
    const today = new Date().toISOString().split("T")[0]
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

    const bookings = await getHostBookings(businessProfile.id)

    if (bookings) {
      // Monthly Stats
      const currentMonthBookings = bookings.filter((b) => b.created_at >= startOfMonth && b.created_at <= today)
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
          phone: booking.users?.phone || "N/A",
        }))
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
    dashboardData = {
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
  } catch (e) {
    console.error("Error loading dashboard:", e)
    error = e instanceof Error ? e.message : "Unknown error"
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

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error || "An unexpected error occurred."}</p>
          <div className="space-y-2">
            {/* Note: In a Server Component, you can't directly trigger a re-fetch like this. */}
            {/* You'd typically redirect or show a static error. For client-side re-fetch, this part would be in a client component. */}
            <Button onClick={() => redirect("/business/home")}>Try Again</Button>
            <Button variant="outline" onClick={() => redirect("/business/experiences")}>
              Manage Experiences
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <BusinessLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Button asChild>
                <Link href="/business/calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Link>
              </Button>
              <Button asChild>
                <Link href="/business/experiences/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Experience
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Monthly Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings Made (This Month)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.bookingsMade}</div>
              <p className="text-xs text-muted-foreground">Total new bookings this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments Received (This Month)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{dashboardData.overview.paymentsReceived.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total payments processed this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings Fulfilled (This Month)</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.bookingsFulfilled}</div>
              <p className="text-xs text-muted-foreground">Experiences completed this month</p>
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
                            {booking.phone && booking.phone !== "N/A" && (
                              <a href={`tel:${booking.phone}`} className="text-xs text-blue-500 flex items-center">
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
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No upcoming bookings</p>
                    <p className="text-sm text-gray-400 mb-4">Set your availability to start receiving bookings</p>
                    <Button asChild>
                      <Link href="/business/calendar">Set Your Availability</Link>
                    </Button>
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
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Your weekly schedule at a glance.</p>
                <p className="text-sm text-gray-400 mb-4">Click below to manage your full calendar.</p>
                <Button asChild>
                  <Link href="/business/calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </Link>
                </Button>
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
                    <Button asChild>
                      <Link href="/business/experiences/new">Create Experience</Link>
                    </Button>
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
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Payout</span>
                  <span className="text-lg font-bold text-yellow-600">
                    €{dashboardData.earnings.pending.toLocaleString()}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">Next Payout Date</div>
                  <div className="text-lg font-semibold">
                    {new Date(dashboardData.earnings.nextPayout.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Amount: €{dashboardData.earnings.nextPayout.amount.toLocaleString()}
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/business/earnings">View Financial Details</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Key Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Key Notifications</CardTitle>
                <CardDescription>Important alerts and announcements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.notifications.length > 0 ? (
                  dashboardData.notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3">
                      <div className="pt-1">{getNotificationIcon(notification.type)}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No new notifications.</div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/business/experiences">
                    <Ship className="h-4 w-4 mr-2" />
                    Manage Experiences
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/business/calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Availability
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/business/team">
                    <Users className="h-4 w-4 mr-2" />
                    Team Management
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/business/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Business Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BusinessLayout>
  )
}
