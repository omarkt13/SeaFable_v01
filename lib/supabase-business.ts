import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { BusinessSettings, HostAvailability } from "@/types/business"
import type { Experience } from "@/lib/database" // Import Experience type from database.ts

// This client is specifically for server-side operations related to business logic.
export function createBusinessSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // This error is expected if called from a client component, but should not happen in server components/route handlers
          console.warn("Could not set cookie from server component in business client:", error)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          console.warn("Could not remove cookie from server component in business client:", error)
        }
      },
    },
  })
}

// Helper to get the server-side Supabase client
function getSupabase() {
  return createBusinessSupabaseServerClient()
}

export async function getHostProfile(userId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("host_profiles").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error in getHostProfile:", error)
    throw error
  }
  return data
}

export async function getBusinessSettings(hostProfileId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("host_business_settings")
    .select("*")
    .eq("host_profile_id", hostProfileId)
    .single()

  if (error) {
    console.error("Error in getBusinessSettings:", error)
    throw error
  }
  return data
}

export async function updateBusinessSettings(hostProfileId: string, settings: Partial<BusinessSettings>) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("host_business_settings")
    .upsert({
      host_profile_id: hostProfileId,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error in updateBusinessSettings:", error)
    throw error
  }
  return data
}

export async function getHostEarnings(hostProfileId: string, startDate?: string, endDate?: string) {
  const supabase = getSupabase()
  let query = supabase
    .from("host_earnings")
    .select(`
      *,
      bookings!host_earnings_booking_id_fkey(
        booking_date,
        experiences!bookings_experience_id_fkey(title)
      )
    `)
    .eq("host_profile_id", hostProfileId)
    .order("created_at", { ascending: false })

  if (startDate) {
    query = query.gte("created_at", startDate)
  }
  if (endDate) {
    query = query.lte("created_at", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error in getHostEarnings:", error)
    throw error
  }
  return data
}

export async function getHostAvailability(hostProfileId: string, startDate?: string, endDate?: string) {
  const supabase = getSupabase()
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

  if (error) {
    console.error("Error in getHostAvailability:", error)
    throw error
  }
  return data
}

export async function setHostAvailability(hostProfileId: string, availability: HostAvailability[]) {
  const supabase = getSupabase()
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

  if (error) {
    console.error("Error in setHostAvailability:", error)
    throw error
  }
  return data
}

export async function getHostTeamMembers(hostProfileId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("host_team_members")
    .select(`
      *,
      users!host_team_members_user_id_fkey(
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .eq("host_profile_id", hostProfileId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error in getHostTeamMembers:", error)
    throw error
  }
  return data
}

export async function getHostAnalytics(hostProfileId: string, days = 30) {
  const supabase = getSupabase()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from("host_analytics")
    .select("*")
    .eq("host_profile_id", hostProfileId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: false })

  if (error) {
    console.error("Error in getHostAnalytics:", error)
    throw error
  }
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
  const supabase = getSupabase()
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

  if (error) {
    console.error("Error in createExperience:", error)
    throw error
  }
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
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("experiences")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", experienceId)
    .select()
    .single()

  if (error) {
    console.error("Error in updateExperience:", error)
    throw error
  }
  return data
}

export async function getHostExperiences(hostId: string): Promise<Experience[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("experiences").select("*").eq("host_id", hostId).eq("is_active", true)

  if (error) {
    console.error("Error in getHostExperiences:", error)
    throw error
  }
  return data || []
}

export async function getHostBookings(hostId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("bookings")
    .select(`
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
    `)
    .eq("host_id", hostId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error in getHostBookings:", error)
    throw error
  }
  return data || []
}
