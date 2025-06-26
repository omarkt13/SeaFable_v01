"use client"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, AlertCircle, Bell } from "lucide-react"
import { getBusinessProfile, getHostExperiences, getHostBookings } from "@/lib/supabase-business"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { StatsOverview } from "@/components/dashboard/business/stats-overview"
import { QuickActions } from "@/components/dashboard/business/quick-actions"
import { RecentBookings } from "@/components/dashboard/business/recent-bookings"
import { UpcomingBookings } from "@/components/dashboard/business/upcoming-bookings"
import { PerformanceMetrics } from "@/components/dashboard/business/performance-metrics"
import { WeatherWidget } from "@/components/dashboard/business/weather-widget"

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
    <BusinessProtectedRoute>
      <BusinessLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <WeatherWidget />
          </div>

          <StatsOverview dashboardData={dashboardData} />
          <QuickActions />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentBookings bookings={dashboardData.recentBookings} />
            <UpcomingBookings bookings={dashboardData.upcomingBookings} />
          </div>

          <PerformanceMetrics dashboardData={dashboardData} />
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}
