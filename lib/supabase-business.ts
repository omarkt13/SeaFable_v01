import { createClient } from "@/lib/supabase/client"
import type { BusinessSettings, HostAvailability } from "@/types/business"

const supabase = createClient()

export async function getHostProfile(userId: string) {
  // Changed from .eq("user_id", userId) to .eq("id", userId)
  const { data, error } = await supabase.from("host_profiles").select("*").eq("id", userId).maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Host profile not found for this user.")
  return data
}

export async function getBusinessSettings(hostProfileId: string) {
  const { data, error } = await supabase
    .from("host_business_settings")
    .select("*")
    .eq("host_profile_id", hostProfileId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return data
}

export async function updateBusinessSettings(hostProfileId: string, settings: Partial<BusinessSettings>) {
  const { data, error } = await supabase
    .from("host_business_settings")
    .upsert(
      {
        host_profile_id: hostProfileId,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "host_profile_id" },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getHostEarnings(hostProfileId: string, startDate?: string, endDate?: string) {
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

  if (error) throw error
  return data
}

export async function getHostAvailability(hostProfileId: string, startDate?: string, endDate?: string) {
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

  if (error) throw error
  return data
}

export async function getHostAnalytics(hostProfileId: string, days = 30) {
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
  itinerary?: any
}) {
  // First, get the host profile ID using the provided host_id (user_id)
  const { data: hostProfile, error: hostError } = await supabase
    .from("host_profiles")
    .select("id")
    .eq("user_id", experienceData.host_id)
    .single()

  if (hostError || !hostProfile) {
    throw new Error("Host profile not found. Please complete business registration first.")
  }

  // Prepare experience data with correct host_id
  const experienceInsertData = {
    host_id: hostProfile.id, // Use host_profiles.id
    title: experienceData.title,
    description: experienceData.description,
    short_description: experienceData.short_description || experienceData.description.substring(0, 150) + '...',
    location: experienceData.location,
    specific_location: experienceData.specific_location,
    country: experienceData.country,
    activity_type: experienceData.activity_type,
    category: experienceData.category || [],
    duration_hours: experienceData.duration_hours,
    duration_display: experienceData.duration_display || `${experienceData.duration_hours} hours`,
    max_guests: experienceData.max_guests,
    min_guests: experienceData.min_guests,
    price_per_person: experienceData.price_per_person,
    difficulty_level: experienceData.difficulty_level,
    primary_image_url: experienceData.primary_image_url,
    weather_contingency: experienceData.weather_contingency,
    included_amenities: experienceData.included_amenities || [],
    what_to_bring: experienceData.what_to_bring || [],
    min_age: experienceData.min_age,
    max_age: experienceData.max_age,
    age_restriction_details: experienceData.age_restriction_details,
    activity_specific_details: experienceData.activity_specific_details || {},
    tags: experienceData.tags || [],
    seasonal_availability: experienceData.seasonal_availability || [],
    rating: 0,
    total_reviews: 0,
    total_bookings: 0,
    is_active: experienceData.is_active ?? true,
  }

  const { data: newExperience, error } = await supabase
    .from("experiences")
    .insert([experienceInsertData])
    .select()
    .single()

  if (error) throw error

  // Create default availability slots for the next 30 days
  try {
    const availabilitySlots = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Skip weekends for default availability (can be customized later)
      if (date.getDay() === 0 || date.getDay() === 6) continue
      
      // Create morning and afternoon slots
      const slots = [
        {
          host_profile_id: hostProfile.id,
          experience_id: newExperience.id,
          date: date.toISOString().split('T')[0],
          start_time: '09:00:00',
          end_time: `${String(9 + Math.floor(experienceData.duration_hours)).padStart(2, '0')}:${String((experienceData.duration_hours % 1) * 60).padStart(2, '0')}:00`,
          available_capacity: experienceData.max_guests,
        },
        {
          host_profile_id: hostProfile.id,
          experience_id: newExperience.id,
          date: date.toISOString().split('T')[0],
          start_time: '14:00:00',
          end_time: `${String(14 + Math.floor(experienceData.duration_hours)).padStart(2, '0')}:${String((experienceData.duration_hours % 1) * 60).padStart(2, '0')}:00`,
          available_capacity: experienceData.max_guests,
        }
      ]
      
      availabilitySlots.push(...slots)
    }

    // Insert availability slots
    if (availabilitySlots.length > 0) {
      const { error: availabilityError } = await supabase
        .from("host_availability")
        .insert(availabilitySlots)

      if (availabilityError) {
        console.warn("Error creating default availability slots:", availabilityError)
        // Don't fail the experience creation for availability issues
      }
    }
  } catch (availabilityError) {
    console.warn("Error creating availability:", availabilityError)
    // Continue without failing the experience creation
  }

  return newExperience
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

export async function updateBusinessProfile(
  hostProfileId: string,
  updates: Partial<{
    business_name: string
    business_description: string
    business_address: string
    business_city: string
    business_state: string
    business_zip_code: string
    business_phone: string
    business_email: string
    website_url: string
    logo_url: string
    cover_image_url: string
    social_media_links: any
    stripe_account_id: string
    currency: string
    timezone: string
    language: string
    cancellation_policy: string
    refund_policy: string
    terms_and_conditions: string
    privacy_policy: string
    is_verified: boolean
    verification_details: any
    status: string
    notes: string
  }>,
) {
  const { data, error } = await supabase
    .from("host_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", hostProfileId)
    .select()
    .single()

  if (error) throw error
  return data
}
