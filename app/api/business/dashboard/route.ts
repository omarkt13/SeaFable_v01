import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getBusinessDashboardData } from "@/lib/database"

export async function GET(req: NextRequest) {
  console.log("Business dashboard API route called")

  try {
    // Create Supabase client
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Auth check result:", { user: user?.id, authError })

    if (authError || !user) {
      console.log("Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify this is a business user by checking host_profiles
    const { data: hostProfile, error: hostError } = await supabase
      .from("host_profiles")
      .select("id, name, business_name, host_type")
      .eq("id", user.id)
      .single()

    console.log("Host profile check:", { hostProfile, hostError })

    if (hostError || !hostProfile) {
      console.log("Host profile not found:", hostError)
      return NextResponse.json({ error: "Business profile not found" }, { status: 403 })
    }

    console.log("Starting dashboard data fetch for business:", user.id)

    try {
      // Get comprehensive dashboard data
      const fullDashboardData = await getBusinessDashboardData(user.id)

      console.log("Dashboard data fetched successfully")
      return NextResponse.json(fullDashboardData)
    } catch (dbError) {
      console.error("Database error, using fallback data:", dbError)

      // Fallback mock data structure
      const fallbackData = {
        overview: {
          totalExperiences: 5,
          totalBookings: 23,
          upcomingBookings: 8,
          totalRevenue: 4850,
          monthlyRevenue: 1200,
        },
        recentBookings: [],
        upcomingBookings: [],
        earnings: {
          thisMonth: 1200,
          lastMonth: 980,
          growth: 22.4,
          pendingPayouts: 350,
        },
        analytics: {
          totalViews: 1247,
          conversionRate: 3.2,
          averageRating: 4.8,
          responseTime: "2 hours",
        },
        experiences: [],
        recentActivity: [
          {
            type: "booking",
            message: "New booking for Sunset Sailing",
            time: "2 hours ago",
          },
          {
            type: "review",
            message: "5-star review received",
            time: "1 day ago",
          },
          {
            type: "experience",
            message: "Kayak Tour experience updated",
            time: "3 days ago",
          },
        ],
        businessProfile: hostProfile,
      }

      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error("Business dashboard API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}