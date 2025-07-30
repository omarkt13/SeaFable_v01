import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHostDashboardData } from '@/lib/database'

export async function GET() {
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

    // Get dashboard data
    const dashboardData = await getHostDashboardData(user.id)

    return NextResponse.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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