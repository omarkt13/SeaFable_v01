
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Dashboard API: Starting request')
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ Dashboard API: Authentication failed', userError?.message)
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        details: userError?.message 
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', { 
      userId: user.id, 
      email: user.email,
      userType: user.user_metadata?.user_type 
    })

    // Verify user is business type
    const userType = user.user_metadata?.user_type
    if (userType !== 'business') {
      console.error('❌ Dashboard API: Non-business user attempted access', { userId: user.id, userType })
      return NextResponse.json({ 
        success: false, 
        error: 'Business access required',
        details: `User type: ${userType}` 
      }, { status: 403 })
    }

    // Check if business profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    let businessProfile = existingProfile

    // Create profile if it doesn't exist
    if (!existingProfile && (!checkError || checkError.code === 'PGRST116')) {
      console.log('⚠️ Creating new business profile for user:', user.id)
      
      const profileData = {
        user_id: user.id,
        name: user.user_metadata?.business_name || user.email?.split('@')[0] || 'Business User',
        email: user.email,
        contact_name: user.user_metadata?.contact_name || user.user_metadata?.full_name || 'Business Contact',
        business_name: user.user_metadata?.business_name || 'SeaFable Business',
        business_type: 'experience_provider',
        host_type: 'business',
        location: user.user_metadata?.location || 'Location TBD',
        phone: user.user_metadata?.phone || '',
        bio: 'Welcome to our business! We provide amazing experiences.',
        rating: 0,
        total_reviews: 0,
        years_experience: 1,
        certifications: [],
        specialties: [],
        languages_spoken: ['English'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newProfile, error: createError } = await supabase
        .from('host_profiles')
        .insert([profileData])
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating business profile:', createError)
        return NextResponse.json({ 
          success: false, 
          error: `Failed to create profile: ${createError.message}` 
        }, { status: 500 })
      }

      businessProfile = newProfile
      console.log('✅ Created new business profile:', newProfile.id)
    }

    if (!businessProfile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to access business profile' 
      }, { status: 500 })
    }

    // Get experiences
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('*')
      .eq('host_id', businessProfile.id)

    // Get bookings
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        experience_id,
        host_id,
        booking_date,
        departure_time,
        number_of_guests,
        total_price,
        booking_status,
        payment_status,
        booked_at,
        experiences (
          id,
          title,
          price_per_person
        ),
        users (
          first_name,
          last_name,
          email
        )
      `)
      .eq('host_id', businessProfile.id)
      .order('booked_at', { ascending: false })
      .limit(20)

    // Calculate metrics with safe defaults
    const safeBookings = bookings || []
    const safeExperiences = experiences || []

    const totalRevenue = safeBookings
      .filter(booking => booking.payment_status === 'succeeded')
      .reduce((sum, booking) => sum + (booking.total_price || 0), 0)

    const activeBookings = safeBookings.filter(booking => 
      ['confirmed', 'pending'].includes(booking.booking_status)
    ).length

    const overview = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeBookings,
      totalExperiences: safeExperiences.length,
      averageRating: safeExperiences.length > 0 
        ? safeExperiences.reduce((sum, exp) => sum + (exp.rating || 0), 0) / safeExperiences.length
        : 0,
      revenueGrowth: 0,
      bookingGrowth: 0
    }

    const recentBookings = safeBookings.slice(0, 5).map(booking => ({
      id: booking.id,
      customerName: booking.users ? 
        `${booking.users.first_name || ''} ${booking.users.last_name || ''}`.trim() || 'Unknown Customer'
        : 'Unknown Customer',
      experienceTitle: booking.experiences?.title || 'Unknown Experience',
      date: new Date(booking.booked_at).toLocaleDateString(),
      amount: booking.total_price || 0,
      guests: booking.number_of_guests || 1,
      avatar: '',
      status: booking.booking_status || 'pending'
    }))

    console.log('✅ Dashboard API: Successfully processed data')

    return NextResponse.json({
      success: true,
      businessProfile,
      overview,
      experiences: safeExperiences || [],
      recentBookings,
      upcomingBookings: [],
      analytics: {
        conversionRate: 0,
        customerSatisfaction: 0,
        repeatCustomerRate: 0,
        marketplaceVsDirectRatio: 0,
        metricsTrend: []
      },
      earnings: {
        thisMonth: Math.round(totalRevenue * 0.3),
        lastMonth: Math.round(totalRevenue * 0.25),
        pending: Math.round(totalRevenue * 0.1),
        nextPayout: { 
          amount: Math.round(totalRevenue * 0.1), 
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        monthlyTrend: []
      },
      recentActivity: [
        { description: 'Dashboard loaded successfully', time: 'Just now', color: 'bg-green-500' }
      ]
    })
  } catch (error) {
    console.error('❌ Dashboard API: Unexpected error', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
