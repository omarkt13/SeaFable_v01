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

    // Get dashboard data
    const dashboardData = {
      user: {
        id: user.id,
        email: user.email,
      },
      businessProfile,
      stats: {
        totalBookings: 0,
        totalRevenue: 0,
        avgRating: businessProfile.rating || 0,
        totalReviews: businessProfile.total_reviews || 0,
      },
      recentBookings: [],
      upcomingBookings: [],
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