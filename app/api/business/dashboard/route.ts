import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  console.log("Dashboard API: Starting request")

  try {
    const supabase = createClient()

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Dashboard API: Auth check", { user: user?.id, error: authError?.message })

    if (authError || !user) {
      console.error("Dashboard API: Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get host profile
    console.log("Dashboard API: Fetching host profile for user:", user.id)

    const { data: hostProfile, error: hostError } = await supabase
      .from("host_profiles")
      .select("id, name, business_name")
      .eq("user_id", user.id)
      .single()

    console.log("Dashboard API: Host profile result", { hostProfile, error: hostError?.message })

    if (hostError || !hostProfile) {
      console.error("Dashboard API: Host profile error:", hostError)
      return NextResponse.json({ error: "Host profile not found" }, { status: 404 })
    }

    const hostId = hostProfile.id
    console.log("Dashboard API: Using host ID:", hostId)

    // Initialize default values
    let totalRevenue = 0
    let activeBookings = 0
    let totalExperiences = 0
    let averageRating = 0
    let recentBookings: any[] = []
    let upcomingBookings: any[] = []

    // Get experiences
    try {
      console.log("Dashboard API: Fetching experiences")
      const { data: experiences, error: expError } = await supabase
        .from("experiences")
        .select("id, rating")
        .eq("host_id", hostId)
        .eq("is_active", true)

      if (!expError && experiences) {
        totalExperiences = experiences.length
        if (experiences.length > 0) {
          const totalRating = experiences.reduce((sum, exp) => sum + (Number(exp.rating) || 0), 0)
          averageRating = totalRating / experiences.length
        }
        console.log("Dashboard API: Experiences loaded:", totalExperiences, "Avg rating:", averageRating)
      } else {
        console.log("Dashboard API: Experiences error:", expError?.message)
      }
    } catch (error) {
      console.error("Dashboard API: Experiences catch error:", error)
    }

    // Get bookings
    try {
      console.log("Dashboard API: Fetching bookings")
      const today = new Date().toISOString().split("T")[0]

      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, total_price, booking_status, booking_date, number_of_guests")
        .eq("host_id", hostId)

      if (!bookingsError && bookings) {
        console.log("Dashboard API: Total bookings found:", bookings.length)

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

        console.log("Dashboard API: Active bookings:", activeBookings, "Revenue:", totalRevenue)
      } else {
        console.log("Dashboard API: Bookings error:", bookingsError?.message)
      }
    } catch (error) {
      console.error("Dashboard API: Bookings catch error:", error)
    }

    // Get recent bookings with basic info
    try {
      console.log("Dashboard API: Fetching recent bookings")
      const { data: recentBookingsData, error: recentError } = await supabase
        .from("bookings")
        .select("id, number_of_guests, total_price, booking_date, booking_status")
        .eq("host_id", hostId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (!recentError && recentBookingsData) {
        recentBookings = recentBookingsData.map((booking) => ({
          id: booking.id,
          customerName: "Customer", // Simplified for now
          experienceTitle: "Water Activity", // Simplified for now
          date: booking.booking_date,
          status: booking.booking_status,
          amount: Number(booking.total_price || 0),
          guests: booking.number_of_guests || 1,
        }))
        console.log("Dashboard API: Recent bookings loaded:", recentBookings.length)
      } else {
        console.log("Dashboard API: Recent bookings error:", recentError?.message)
      }
    } catch (error) {
      console.error("Dashboard API: Recent bookings catch error:", error)
    }

    // Get upcoming bookings
    try {
      console.log("Dashboard API: Fetching upcoming bookings")
      const today = new Date().toISOString().split("T")[0]

      const { data: upcomingBookingsData, error: upcomingError } = await supabase
        .from("bookings")
        .select("id, number_of_guests, booking_date, departure_time")
        .eq("host_id", hostId)
        .eq("booking_status", "confirmed")
        .gte("booking_date", today)
        .order("booking_date", { ascending: true })
        .limit(5)

      if (!upcomingError && upcomingBookingsData) {
        upcomingBookings = upcomingBookingsData.map((booking) => ({
          id: booking.id,
          customerName: "Customer", // Simplified for now
          experienceTitle: "Water Activity", // Simplified for now
          date: booking.booking_date,
          time: booking.departure_time || "09:00",
          guests: booking.number_of_guests || 1,
        }))
        console.log("Dashboard API: Upcoming bookings loaded:", upcomingBookings.length)
      } else {
        console.log("Dashboard API: Upcoming bookings error:", upcomingError?.message)
      }
    } catch (error) {
      console.error("Dashboard API: Upcoming bookings catch error:", error)
    }

    // Build response
    const dashboardData = {
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
      businessProfile: {
        name: hostProfile.name || hostProfile.business_name || "Your Business",
      },
    }

    console.log("Dashboard API: Success, returning data")
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Dashboard API: Catch error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
