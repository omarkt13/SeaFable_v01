import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getHostDashboardData } from "@/lib/database"

export async function GET(request: NextRequest) {
  console.log("=== Dashboard API: Starting request")

  try {
    const supabase = createClient()

    // Get user from auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("❌ Dashboard API: Authentication failed", userError?.message || "No authenticated user!")
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    console.log("✅ Dashboard API: User authenticated:", user.id)

    const dashboardData = await getHostDashboardData(user.id)

    if (!dashboardData) {
      console.error("❌ Dashboard API: Failed to fetch dashboard data")
      return NextResponse.json(
        { error: "Failed to retrieve dashboard data" },
        { status: 500 }
      )
    }

    console.log("✅ Dashboard API: Successfully fetched dashboard data")

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("❌ Dashboard API: Unexpected error", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}