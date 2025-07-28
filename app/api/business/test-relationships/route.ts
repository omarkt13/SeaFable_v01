
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getHostDashboardData } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    const testResults = {
      userId: user.id,
      userType: user.user_metadata?.user_type,
      tests: []
    }

    // Test 1: Host Profile Lookup (should use host_profiles.id for business users)
    try {
      const { data: hostProfile, error: hostError } = await supabase
        .from("host_profiles")
        .select("*")
        .eq("id", user.id)  // For business users, userId should match host_profiles.id
        .single()

      testResults.tests.push({
        name: "Host Profile Lookup",
        success: !hostError,
        error: hostError?.message,
        details: {
          found: !!hostProfile,
          profileId: hostProfile?.id,
          userId: hostProfile?.user_id,
          matches: hostProfile?.id === user.id
        }
      })
    } catch (error) {
      testResults.tests.push({
        name: "Host Profile Lookup",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 2: Experiences Relationship (should use host_profiles.id as host_id)
    try {
      const { data: experiences, error: expError } = await supabase
        .from("experiences")
        .select(`
          id,
          title,
          host_id,
          host_profiles!experiences_host_id_fkey (
            id,
            name,
            user_id
          )
        `)
        .eq("host_id", user.id)  // host_id should reference host_profiles.id

      testResults.tests.push({
        name: "Experiences Relationship",
        success: !expError,
        error: expError?.message,
        details: {
          experienceCount: experiences?.length || 0,
          validRelationships: experiences?.filter(exp => exp.host_profiles?.id === exp.host_id).length || 0
        }
      })
    } catch (error) {
      testResults.tests.push({
        name: "Experiences Relationship", 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 3: Bookings Relationships (complex multi-table)
    try {
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          id,
          user_id,
          host_id,
          experience_id,
          total_price,
          experiences!bookings_experience_id_fkey (
            id,
            title,
            host_id
          ),
          users!bookings_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq("host_id", user.id)  // host_id should reference host_profiles.id

      const validBookings = bookings?.filter(booking => 
        booking.experiences && 
        booking.users && 
        booking.host_id === booking.experiences.host_id
      ) || []

      testResults.tests.push({
        name: "Bookings Relationships",
        success: !bookingError,
        error: bookingError?.message,
        details: {
          totalBookings: bookings?.length || 0,
          validRelationships: validBookings.length,
          hasUserData: bookings?.filter(b => b.users).length || 0,
          hasExperienceData: bookings?.filter(b => b.experiences).length || 0
        }
      })
    } catch (error) {
      testResults.tests.push({
        name: "Bookings Relationships",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 4: Dashboard Function Integration
    try {
      const dashboardResult = await getHostDashboardData(user.id)
      
      testResults.tests.push({
        name: "Dashboard Function Integration",
        success: dashboardResult.success,
        error: dashboardResult.error,
        details: {
          hasBusinessProfile: !!dashboardResult.data?.businessProfile,
          totalRevenue: dashboardResult.data?.overview.totalRevenue || 0,
          activeBookings: dashboardResult.data?.overview.activeBookings || 0,
          totalExperiences: dashboardResult.data?.overview.totalExperiences || 0,
          recentBookingsCount: dashboardResult.data?.recentBookings.length || 0
        }
      })
    } catch (error) {
      testResults.tests.push({
        name: "Dashboard Function Integration",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Summary
    const successCount = testResults.tests.filter(t => t.success).length
    const totalTests = testResults.tests.length

    return NextResponse.json({
      success: successCount === totalTests,
      summary: {
        passed: successCount,
        failed: totalTests - successCount,
        total: totalTests,
        successRate: Math.round((successCount / totalTests) * 100)
      },
      ...testResults
    })

  } catch (error) {
    console.error('Relationship test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
