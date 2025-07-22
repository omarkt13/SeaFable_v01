import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication with better error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error("Dashboard API - Auth error:", authError.message)
      return NextResponse.json(
        { error: "Authentication error", details: authError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.error("Dashboard API - No user found in session")
      return NextResponse.json(
        { error: "No authenticated user found" },
        { status: 401 }
      )
    }

    console.log("Dashboard API - Authenticated user:", user.id)

    // Fetch business profile with better error handling
    const { data: businessProfile, error: profileError } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Dashboard API - Profile error:", profileError.message)
      return NextResponse.json(
        { error: "Failed to fetch business profile", details: profileError.message },
        { status: 500 }
      )
    }

    if (!businessProfile) {
      console.error("Dashboard API - No business profile found for user:", user.id)
      return NextResponse.json(
        { error: "Business profile not found" },
        { status: 404 }
      )
    }

    console.log("Dashboard API - Business profile found:", businessProfile.contact_name)

    // Get dashboard data - use the proper database function
    try {
      // Import the database function
      const { getBusinessDashboardData } = await import("@/lib/database")
      
      // Get comprehensive dashboard data
      const fullDashboardData = await getBusinessDashboardData(user.id)
      
      return NextResponse.json(fullDashboardData)
    } catch (dbError) {
      console.error("Dashboard API - Database error:", dbError)
      
      // Fallback to basic data structure
      const dashboardData = {
        user: {
          id: user.id,
          email: user.email,
        },
        businessProfile,
        overview: {
          totalRevenue: 0,
          activeBookings: 0,
          totalExperiences: 0,
          averageRating: businessProfile.rating || 0,
          revenueGrowth: 0,
          bookingGrowth: 0,
        },
        recentBookings: [],
        upcomingBookings: [],
        earnings: {
          thisMonth: 0,
          lastMonth: 0,
          pending: 0,
          nextPayout: { amount: 0, date: new Date().toLocaleDateString() },
          monthlyTrend: [],
        },
        analytics: {
          conversionRate: 0,
          customerSatisfaction: 0,
          repeatCustomerRate: 0,
          marketplaceVsDirectRatio: 0,
          metricsTrend: [],
        },
        experiences: [],
        recentActivity: [],
      }
      
      return NextResponse.json(dashboardData)
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Dashboard API - Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}