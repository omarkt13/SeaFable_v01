
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: userError?.message 
      }, { status: 401 })
    }

    // Check host_profiles table
    const { data: hostProfile, error: hostError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Check if table exists by trying to count rows
    const { count, error: countError } = await supabase
      .from('host_profiles')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.id,
        userEmail: user.email,
        userType: user.user_metadata?.user_type,
        userMetadata: user.user_metadata,
        hostProfile: hostProfile,
        hostProfileError: hostError?.message,
        hostProfilesTableCount: count,
        hostProfilesTableError: countError?.message,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Profile debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
