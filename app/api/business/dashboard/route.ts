
import { NextRequest, NextResponse } from 'next/server'
import { getBusinessDashboardData } from '@/lib/database'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Dashboard API: Authentication failed', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        details: userError?.message 
      }, { status: 401 })
    }

    // Verify user is business type
    const userType = user.user_metadata?.user_type
    if (userType !== 'business') {
      console.error('Dashboard API: Non-business user attempted access', { userId: user.id, userType })
      return NextResponse.json({ 
        success: false, 
        error: 'Business access required',
        details: `User type: ${userType}` 
      }, { status: 403 })
    }

    console.log('Dashboard API: Fetching data for business user', { userId: user.id, email: user.email })

    // Get dashboard data
    const dashboardData = await getBusinessDashboardData(user.id)

    if (!dashboardData.success) {
      console.error('Dashboard API: Data fetch failed', dashboardData.error)
      return NextResponse.json({ 
        success: false, 
        error: dashboardData.error,
        details: dashboardData.details || 'Failed to fetch dashboard data'
      }, { status: 500 })
    }

    console.log('Dashboard API: Successfully fetched data', { 
      userId: user.id, 
      hasBusinessProfile: !!dashboardData.data?.businessProfile,
      experienceCount: dashboardData.data?.experiences?.length || 0,
      bookingCount: dashboardData.data?.recentBookings?.length || 0
    })

    return NextResponse.json({
      success: true,
      businessProfile: dashboardData.data?.businessProfile,
      overview: dashboardData.data?.overview,
      experiences: dashboardData.data?.experiences || [],
      recentBookings: dashboardData.data?.recentBookings || [],
      upcomingBookings: dashboardData.data?.upcomingBookings || [],
      analytics: dashboardData.data?.analytics,
      earnings: dashboardData.data?.earnings,
      recentActivity: dashboardData.data?.recentActivity || []
    })
  } catch (error) {
    console.error('Dashboard API: Unexpected error', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is business type
    const userType = user.user_metadata?.user_type
    if (userType !== 'business') {
      return NextResponse.json(
        { error: 'Business account required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Handle different types of business actions here
    // This is where you'd process form submissions, updates, etc.

    return NextResponse.json({
      success: true,
      message: 'Action completed successfully'
    })
  } catch (error) {
    console.error('Dashboard POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
