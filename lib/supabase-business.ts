import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"
import { cache } from "react"

const serverSupabase = createServerClient()
const browserSupabase = createBrowserClient()

export async function getHostProfile(userId: string) {
  const { data, error } = await serverSupabase.from("host_profiles").select("*").eq("user_id", userId).maybeSingle()

  if (error) throw error
  if (!data) return null
  return data
}

export async function getBusinessSettings(
  hostProfileId: string,
): Promise<{ data: Database["public"]["Tables"]["host_business_settings"]["Row"] | null; error: any }> {
  const { data, error } = await serverSupabase
    .from("host_business_settings")
    .select("*")
    .eq("host_profile_id", hostProfileId)
    .maybeSingle()

  if (error) throw error
  if (!data) return { data: null, error: null }
  return data
}

export async function updateBusinessSettings(
  hostProfileId: string,
  settings: Partial<Database["public"]["Tables"]["host_business_settings"]["Row"]>,
) {
  const { data, error } = await serverSupabase
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
  let query = serverSupabase
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
  let query = serverSupabase
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

export async function setHostAvailability(hostProfileId: string, availability: any[]) {
  const { data, error } = await serverSupabase
    .from("host_availability")
    .upsert(
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
  const { data, error } = await serverSupabase
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

  const { data, error } = await serverSupabase
    .from("host_analytics")
    .select("*")
    .eq("host_profile_id", hostProfileId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: false })

  if (error) throw error
  return data
}

// Cache frequently accessed data
export const getCachedHostProfile = cache(async (hostId: string) => {
  const { data, error } = await serverSupabase
    .from("host_profiles")
    .select(`
      *,
      host_business_settings (
        onboarding_completed,
        marketplace_enabled
      )
    `)
    .eq("id", hostId)
    .single()

  if (error) throw error
  return data
})

// Optimized experience creation with transaction-like behavior
export async function createExperience(experienceData: any) {
  const { data: experience, error: experienceError } = await browserSupabase
    .from("experiences")
    .insert([experienceData])
    .select()
    .single()

  if (experienceError) throw experienceError

  // Update host statistics
  const { error: statsError } = await browserSupabase.rpc("increment_host_experience_count", {
    host_id: experienceData.host_id,
  })

  if (statsError) {
    console.warn("Failed to update host statistics:", statsError)
    // Don't fail the entire operation for statistics
  }

  return experience
}

// Batch operations for better performance
export async function batchUpdateExperiences(updates: Array<{ id: string; data: any }>) {
  const results = await Promise.allSettled(
    updates.map(({ id, data }) => browserSupabase.from("experiences").update(data).eq("id", id).select().single()),
  )

  const successful = results
    .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
    .map((result) => result.value.data)

  const failed = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason)

  return { successful, failed }
}

// Optimized availability setting with conflict detection
export async function setHostAvailabilityWithConflictCheck(hostId: string, availabilitySlots: any[]) {
  try {
    // Check for conflicts first
    const existingSlots = await browserSupabase
      .from("host_availability")
      .select("date, start_time, end_time")
      .eq("host_profile_id", hostId)
      .in(
        "date",
        availabilitySlots.map((slot) => slot.date),
      )

    if (existingSlots.error) throw existingSlots.error

    // Filter out conflicting slots
    const conflicts = availabilitySlots.filter((newSlot) =>
      existingSlots.data?.some(
        (existing) =>
          existing.date === newSlot.date &&
          ((newSlot.startTime >= existing.start_time && newSlot.startTime < existing.end_time) ||
            (newSlot.endTime > existing.start_time && newSlot.endTime <= existing.end_time)),
      ),
    )

    if (conflicts.length > 0) {
      throw new Error(`Availability conflicts detected for ${conflicts.length} slots`)
    }

    // Insert new availability slots
    const { data, error } = await browserSupabase
      .from("host_availability")
      .insert(
        availabilitySlots.map((slot) => ({
          host_profile_id: hostId,
          date: slot.date,
          start_time: slot.startTime,
          end_time: slot.endTime,
          available_capacity: slot.availableCapacity,
          price_override: slot.priceOverride,
          notes: slot.notes,
          weather_dependent: slot.weatherDependent,
          is_recurring: slot.isRecurring,
          recurring_pattern: slot.recurringPattern,
        })),
      )
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error setting host availability:", error)
    throw error
  }
}

export async function updateBusinessProfile(
  hostProfileId: string,
  updates: Partial<Database["public"]["Tables"]["host_profiles"]["Row"]>,
) {
  const { data, error } = await serverSupabase
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
