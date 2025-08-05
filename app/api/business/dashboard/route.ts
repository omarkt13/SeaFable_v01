import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getHostDashboardData } from "@/lib/database"

export async function GET(request: NextRequest) {
  console.log("=== Dashboard API: Starting request")

  try {
    const supabase = await createClient()

    // Debug: Check cookies
    const cookieHeader = request.headers.get('cookie')
    console.log("🍪 Dashboard API: Cookie header exists:", !!cookieHeader)
    console.log("🍪 Dashboard API: Cookies:", cookieHeader?.substring(0, 200) + "...")
    
    // Get session from cookies (server-side auth) with retry logic
    let session = null
    let sessionError = null
    
    try {
      const sessionResult = await supabase.auth.getSession()
      session = sessionResult.data.session
      sessionError = sessionResult.error
    } catch (error) {
      console.error("🔥 Session retrieval failed:", error)
      sessionError = error
    }

    console.log("🔐 Dashboard API: Session check result", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      error: sessionError?.message
    })

    if (sessionError || !session?.user) {
      console.log("❌ Dashboard API: Authentication failed", sessionError?.message || "Auth session missing!")
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const user = session.user

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