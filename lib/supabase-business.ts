import { createServerClient } from "@/lib/supabase/server"
import type { BusinessSettings, HostAvailability } from "@/types/business"
import { cookies } from "next/headers"

// Helper to get server-side Supabase client
function getSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(cookieStore)
}

export async function getHostProfile(userId: string) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from("host_profiles").select("*").eq("user_id", userId).single()

  if (error) throw error
  return data
}

export async function getBusinessSettings(hostProfileId: string) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("host_business_settings")
    .select("*")
    .eq("host_profile_id", hostProfileId)
    .single()

  if (error) throw error
  return data
}

export async function updateBusinessSettings(hostProfileId: string, settings: Partial<BusinessSettings>) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("host_business_settings")
    .upsert({
      host_profile_id: hostProfileId,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getHostEarnings(hostProfileId: string, startDate?: string, endDate?: string) {
  const supabase = getSupabaseServerClient()
  let query = supabase
    .from("host_earnings")
    .select(
      `
      *,
      bookings!host_earnings_booking_id_fkey(
        booking_date,
        experiences!bookings_experience_id_fkey(title)
      )
    `,
    )
    .eq("host_profile_id", hostProfileId)
    .order("created_at", { ascending: false })

  if (startDate) {
    query = query.gte("created_at", startDate)
  }
  if (endDate) {
    query = query.lte("created_at", endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getHostAvailability(hostProfileId: string, startDate?: string, endDate?: string) {
  const supabase = getSupabaseServerClient()
  let query = supabase
    .from("host_availability")
    .select("*")
    .eq("host_profile_id", hostProfileId)
    .order("date", { ascending: true })

  if (startDate) {
    query = query.gte("date", startDate)
  }
  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function setHostAvailability(hostProfileId: string, availability: HostAvailability[]) {
  const supabase = getSupabaseServerClient()
  // Delete existing availability for the dates
  const dates = availability.map((a) => a.date)
  await supabase.from("host_availability").delete().eq("host_profile_id", hostProfileId).in("date", dates)

  // Insert new availability
  const { data, error } = await supabase
    .from("host_availability")
    .insert(
      availability.map((a) => ({
        host_profile_id: hostProfileId,
        date: a.date,
        start_time: a.startTime,
        end_time: a.endTime,
        available_capacity: a.availableCapacity,
        price_override: a.priceOverride,
        notes: a.notes,
        weather_dependent: a.weatherDependent,
        is_recurring: a.isRecurring,
        recurring_pattern: a.recurringPattern,
      })),
    )
    .select()

  if (error) throw error
  return data
}

export async function getHostTeamMembers(hostProfileId: string) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("host_team_members")
    .select(
      `
      *,
      users!host_team_members_user_id_fkey(
        first_name,
        last_name,
        email,
        avatar_url
      )
    `,
    )
    .eq("host_profile_id", hostProfileId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getHostAnalytics(hostProfileId: string, days = 30) {
  const supabase = getSupabaseServerClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from("host_analytics")
    .select("*")
    .eq("host_profile_id", hostProfileId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: false })

  if (error) throw error
  return data
}

// Experience Management Functions
export async function createExperience(experienceData: {
  host_id: string
  title: string
  description: string
  short_description?: string
  location: string
  specific_location?: string
  country?: string
  activity_type: string
  category: string[]
  duration_hours: number
  duration_display?: string
  max_guests: number
  min_guests: number
  price_per_person: number
  difficulty_level: string
  primary_image_url?: string
  weather_contingency?: string
  included_amenities: string[]
  what_to_bring: string[]
  min_age?: number
  max_age?: number
  age_restriction_details?: string
  activity_specific_details?: any
  tags: string[]
  seasonal_availability: string[]
  is_active?: boolean
  itinerary?: any // Include itinerary
}) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("experiences")
    .insert([
      {
        ...experienceData,
        rating: 0, // Default values for new experiences
        total_reviews: 0,
        total_bookings: 0,
        is_active: experienceData.is_active ?? true, // Default to active if not provided
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExperience(
  experienceId: string,
  updates: Partial<{
    title: string
    description: string
    short_description: string
    location: string
    specific_location: string
    country: string
    activity_type: string
    category: string[]
    duration_hours: number
    duration_display: string
    max_guests: number
    min_guests: number
    price_per_person: number
    difficulty_level: string
    primary_image_url: string
    weather_contingency: string
    included_amenities: string[]
    what_to_bring: string[]
    min_age: number
    max_age: number
    age_restriction_details: string
    activity_specific_details: any
    tags: string[]
    seasonal_availability: string[]
    is_active: boolean
    itinerary: any // Include itinerary
  }>,
) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("experiences")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", experienceId)
    .select()
    .single()

  if (error) throw error
  return data
}

// New functions for business home page data fetching
export async function getHostExperiences(hostId: string) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("experiences")
    .select("id, title, rating, total_reviews, total_bookings, primary_image_url, host_profiles(name, avatar_url)")
    .eq("host_id", hostId)
    .eq("is_active", true)

  if (error) throw error
  return data
}

export async function getHostBookings(hostId: string) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      total_price,
      booking_status,
      booking_date,
      number_of_guests,
      departure_time,
      special_requests,
      created_at,
      payment_status,
      users!bookings_user_id_fkey(first_name, last_name, phone),
      experiences!bookings_experience_id_fkey(title)
    `,
    )
    .eq("host_id", hostId)

  if (error) throw error
  return data
}
