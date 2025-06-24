import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Test database connections
    const tests = []

    // Test 1: Check if new tables exist
    const { data: businessSettings, error: settingsError } = await supabase
      .from("host_business_settings")
      .select("count")
      .limit(1)

    tests.push({
      name: "host_business_settings table",
      status: settingsError ? "❌ FAILED" : "✅ PASSED",
      error: settingsError?.message,
    })

    const { data: earnings, error: earningsError } = await supabase.from("host_earnings").select("count").limit(1)

    tests.push({
      name: "host_earnings table",
      status: earningsError ? "❌ FAILED" : "✅ PASSED",
      error: earningsError?.message,
    })

    const { data: availability, error: availabilityError } = await supabase
      .from("host_availability")
      .select("count")
      .limit(1)

    tests.push({
      name: "host_availability table",
      status: availabilityError ? "❌ FAILED" : "✅ PASSED",
      error: availabilityError?.message,
    })

    const { data: teamMembers, error: teamError } = await supabase.from("host_team_members").select("count").limit(1)

    tests.push({
      name: "host_team_members table",
      status: teamError ? "❌ FAILED" : "✅ PASSED",
      error: teamError?.message,
    })

    const { data: analytics, error: analyticsError } = await supabase.from("host_analytics").select("count").limit(1)

    tests.push({
      name: "host_analytics table",
      status: analyticsError ? "❌ FAILED" : "✅ PASSED",
      error: analyticsError?.message,
    })

    // Test 2: Check existing tables
    const { data: hostProfiles, error: hostError } = await supabase.from("host_profiles").select("id, name").limit(5)

    tests.push({
      name: "host_profiles data",
      status: hostError ? "❌ FAILED" : "✅ PASSED",
      data: hostProfiles?.length || 0,
      error: hostError?.message,
    })

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, booking_status")
      .limit(5)

    tests.push({
      name: "bookings data",
      status: bookingsError ? "❌ FAILED" : "✅ PASSED",
      data: bookingsData?.length || 0,
      error: bookingsError?.message,
    })

    const { data: experiencesData, error: experiencesError } = await supabase
      .from("experiences")
      .select("id, title")
      .limit(5)

    tests.push({
      name: "experiences data",
      status: experiencesError ? "❌ FAILED" : "✅ PASSED",
      data: experiencesData?.length || 0,
      error: experiencesError?.message,
    })

    // Test 3: Check dashboard API functionality
    try {
      const dashboardResponse = await fetch(`${request.nextUrl.origin}/api/business/dashboard`, {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      })
      tests.push({
        name: "dashboard API",
        status: dashboardResponse.ok ? "✅ PASSED" : "❌ FAILED",
        data: dashboardResponse.status,
      })
    } catch (dashboardError) {
      tests.push({
        name: "dashboard API",
        status: "❌ FAILED",
        error: dashboardError instanceof Error ? dashboardError.message : "Unknown error",
      })
    }

    const summary = {
      total: tests.length,
      passed: tests.filter((t) => t.status.includes("✅")).length,
      failed: tests.filter((t) => t.status.includes("❌")).length,
    }

    return NextResponse.json({
      summary,
      tests,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ error: "Test failed", details: error }, { status: 500 })
  }
}
