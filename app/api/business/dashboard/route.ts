
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Request validation schema
const DashboardRequestSchema = z.object({
  businessId: z.string().uuid().optional(),
})

// Response error handler
function handleError(error: unknown, context: string) {
  console.error(`Dashboard API Error in ${context}:`, error)
  
  if (error instanceof Error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        context,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
  
  return NextResponse.json(
    { 
      success: false, 
      error: "An unexpected error occurred",
      context,
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  )
}

// Data validation helper
function validateDashboardData(data: any) {
  const requiredFields = ['businessProfile', 'overview', 'recentBookings', 'upcomingBookings']
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required dashboard data: ${missingFields.join(', ')}`)
  }
  
  return true
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get business ID from URL or use authenticated user ID
    const url = new URL(request.url)
    const businessId = url.searchParams.get('businessId') || user.id

    // Validate request
    const validation = DashboardRequestSchema.safeParse({ businessId })
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid business ID format" },
        { status: 400 }
      )
    }

    console.log(`Fetching dashboard data for business: ${businessId}`)

    // Retry mechanism for database operations
    const fetchWithRetry = async <T>(operation: () => Promise<T>, context: string): Promise<T> => {
      let lastError: Error | null = null
      const maxRetries = 3
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation()
        } catch (error) {
          lastError = error as Error
          console.warn(`${context} failed (attempt ${attempt}/${maxRetries}):`, error)
          
          if (attempt === maxRetries) {
            throw lastError
          }
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
        }
      }
      
      throw lastError
    }

    // Fetch business profile with retry
    const businessProfile = await fetchWithRetry(async () => {
      const { data, error } = await supabase
        .from("host_profiles")
        .select("*")
        .eq("id", businessId)
        .single()

      if (error) throw new Error(`Business profile fetch failed: ${error.message}`)
      if (!data) throw new Error("Business profile not found")
      
      return data
    }, "Business profile fetch")

    // Fetch experiences with retry
    const experiences = await fetchWithRetry(async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("host_id", businessId)
        .order("created_at", { ascending: false })

      if (error) throw new Error(`Experiences fetch failed: ${error.message}`)
      return data || []
    }, "Experiences fetch")

    // Fetch bookings with retry
    const bookings = await fetchWithRetry(async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          experiences!bookings_experience_id_fkey (
            id,
            title,
            location,
            primary_image_url,
            duration_display,
            activity_type
          ),
          user_profiles!bookings_user_id_fkey (
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq("host_id", businessId)
        .order("booking_date", { ascending: false })

      if (error) throw new Error(`Bookings fetch failed: ${error.message}`)
      return data || []
    }, "Bookings fetch")

    // Calculate overview statistics
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const completedBookings = bookings.filter(b => 
      b.booking_status === "completed" || b.booking_status === "confirmed"
    )
    
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
    const activeBookings = bookings.filter(b => 
      b.booking_status === "confirmed" || b.booking_status === "pending"
    ).length
    
    const averageRating = experiences.length > 0
      ? experiences.reduce((sum, exp) => sum + (exp.rating || 0), 0) / experiences.length
      : 0

    // Recent bookings (last 5)
    const recentBookings = bookings.slice(0, 5).map(booking => ({
      id: booking.id,
      customerName: `${booking.user_profiles?.first_name || "Unknown"} ${booking.user_profiles?.last_name || "User"}`,
      experienceTitle: booking.experiences?.title || "N/A",
      date: new Date(booking.booking_date).toLocaleDateString(),
      amount: booking.total_price || 0,
      guests: booking.number_of_guests || 1,
      avatar: booking.user_profiles?.avatar_url || "/placeholder.svg?height=40&width=40",
      status: booking.booking_status || "pending",
    }))

    // Upcoming bookings
    const upcomingBookings = bookings
      .filter(b => new Date(b.booking_date) > now)
      .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
      .slice(0, 5)
      .map(booking => ({
        id: booking.id,
        customerName: `${booking.users?.first_name || "Unknown"} ${booking.users?.last_name || "User"}`,
        experienceTitle: booking.experiences?.title || "N/A",
        date: new Date(booking.booking_date).toLocaleDateString(),
        time: booking.departure_time || "N/A",
        guests: booking.number_of_guests || 1,
        specialRequests: booking.special_requests || "",
        phone: "N/A", // Will be added when user table includes phone
      }))

    // Build dashboard data
    const dashboardData = {
      businessProfile,
      overview: {
        totalRevenue,
        activeBookings,
        totalExperiences: experiences.length,
        averageRating: Number.parseFloat(averageRating.toFixed(1)),
        revenueGrowth: 0, // Will be calculated with historical data
        bookingGrowth: 0, // Will be calculated with historical data
      },
      recentBookings,
      upcomingBookings,
      earnings: {
        thisMonth: 0, // Will be calculated properly
        lastMonth: 0, // Will be calculated properly
        pending: bookings
          .filter(b => b.payment_status === "pending")
          .reduce((sum, b) => sum + (b.total_price || 0), 0),
        nextPayout: {
          amount: 0,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        },
        monthlyTrend: [], // Will be populated with historical data
      },
      analytics: {
        conversionRate: 0, // Will be calculated with visit data
        customerSatisfaction: Number.parseFloat((averageRating * 20).toFixed(1)),
        repeatCustomerRate: 0, // Will be calculated
        marketplaceVsDirectRatio: 75, // Placeholder
        metricsTrend: [
          { name: "Bookings", value: bookings.length },
          { name: "Revenue", value: totalRevenue / 1000 },
          { name: "Experiences", value: experiences.length },
          { name: "Rating", value: averageRating * 20 },
        ],
      },
      experiences: experiences.map(exp => ({
        id: exp.id,
        title: exp.title,
        status: exp.is_active ? ("active" as const) : ("inactive" as const),
        bookings: bookings.filter(b => b.experience_id === exp.id).length,
        revenue: bookings
          .filter(b => b.experience_id === exp.id && (b.booking_status === "completed" || b.booking_status === "confirmed"))
          .reduce((sum, b) => sum + (b.total_price || 0), 0),
        rating: exp.rating || 0,
      })),
      recentActivity: [
        ...bookings.slice(0, 3).map(b => ({
          description: `New booking for ${b.experiences?.title || "an experience"}`,
          time: `${Math.floor((now.getTime() - new Date(b.booked_at || b.booking_date).getTime()) / (1000 * 60 * 60))} hours ago`,
          color: "bg-green-500",
        })),
        ...experiences.slice(0, 2).map(exp => ({
          description: `Experience "${exp.title}" ${exp.is_active ? "activated" : "updated"}`,
          time: `${Math.floor((now.getTime() - new Date(exp.updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
          color: "bg-blue-500",
        })),
      ].slice(0, 5),
    }

    // Validate response data
    validateDashboardData(dashboardData)

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    return handleError(error, "Dashboard data fetch")
  }
}
