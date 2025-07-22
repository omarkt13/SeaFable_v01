
import { supabase } from './supabase'

// Helper functions for fetching real data from database
export async function fetchBusinessProfile(userId: string) {
  const { data, error } = await supabase
    .from('host_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function fetchBusinessStats(businessId: string) {
  // Fetch bookings for revenue and booking count
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      total_price,
      status,
      booking_date,
      experiences!inner (
        host_profiles!inner (
          business_id
        )
      )
    `)
    .eq('experiences.host_profiles.business_id', businessId)

  if (bookingsError) throw bookingsError

  const totalBookings = bookings?.length || 0
  const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0
  
  const now = new Date()
  const upcomingBookings = bookings?.filter(booking => 
    new Date(booking.booking_date) > now && booking.status !== 'cancelled'
  ).length || 0

  // Fetch average rating from experiences
  const { data: experiences, error: experiencesError } = await supabase
    .from('experiences')
    .select('average_rating')
    .eq('business_id', businessId)

  if (experiencesError) throw experiencesError

  const averageRating = experiences?.length > 0 
    ? experiences.reduce((sum, exp) => sum + (exp.average_rating || 0), 0) / experiences.length
    : 0

  return {
    totalBookings,
    totalRevenue,
    averageRating,
    upcomingBookings
  }
}

export async function fetchRecentActivity(businessId: string, limit = 5) {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      created_at,
      status,
      experiences!inner (
        title,
        host_profiles!inner (
          business_id
        )
      )
    `)
    .eq('experiences.host_profiles.business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return bookings?.map(booking => ({
    id: booking.id,
    type: 'Booking',
    description: `New booking for ${booking.experiences?.title}`,
    time: formatTimeAgo(booking.created_at)
  })) || []
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return 'Just now'
}

// Remove all mock data objects - they are no longer needed
