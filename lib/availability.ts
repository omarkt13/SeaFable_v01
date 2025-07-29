
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface AvailabilitySlot {
  id?: string
  host_profile_id: string
  experience_id: string
  date: string // YYYY-MM-DD format
  start_time: string // HH:MM:SS format
  end_time: string // HH:MM:SS format
  available_capacity: number
  price_override?: number | null
  created_at?: string
  updated_at?: string
}

export async function createAvailabilitySlot(slot: Omit<AvailabilitySlot, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from("host_availability")
      .insert([slot])
      .select()
      .single()

    if (error) {
      console.error("Error creating availability slot:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error creating availability slot:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function getExperienceAvailability(experienceId: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from("host_availability")
      .select("*")
      .eq("experience_id", experienceId)
      .gte("date", startDate || new Date().toISOString().split('T')[0])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (endDate) {
      query = query.lte("date", endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching availability:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error("Unexpected error fetching availability:", error)
    return { success: false, error: error.message || "An unexpected error occurred", data: [] }
  }
}

export async function updateAvailabilitySlot(slotId: string, updates: Partial<AvailabilitySlot>) {
  try {
    const { data, error } = await supabase
      .from("host_availability")
      .update(updates)
      .eq("id", slotId)
      .select()
      .single()

    if (error) {
      console.error("Error updating availability slot:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error updating availability slot:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function deleteAvailabilitySlot(slotId: string) {
  try {
    const { error } = await supabase
      .from("host_availability")
      .delete()
      .eq("id", slotId)

    if (error) {
      console.error("Error deleting availability slot:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error deleting availability slot:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function getHostAvailability(hostProfileId: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from("host_availability")
      .select(`
        *,
        experiences (
          id,
          title,
          duration_hours,
          max_guests
        )
      `)
      .eq("host_profile_id", hostProfileId)
      .gte("date", startDate || new Date().toISOString().split('T')[0])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (endDate) {
      query = query.lte("date", endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching host availability:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error("Unexpected error fetching host availability:", error)
    return { success: false, error: error.message || "An unexpected error occurred", data: [] }
  }
}

// Helper function to generate availability slots for multiple days
export async function createBulkAvailability(
  hostProfileId: string,
  experienceId: string,
  dates: string[],
  timeSlots: { start_time: string; end_time: string }[],
  capacity: number,
  priceOverride?: number
) {
  try {
    const slots: Omit<AvailabilitySlot, 'id' | 'created_at' | 'updated_at'>[] = []

    dates.forEach(date => {
      timeSlots.forEach(timeSlot => {
        slots.push({
          host_profile_id: hostProfileId,
          experience_id: experienceId,
          date,
          start_time: timeSlot.start_time,
          end_time: timeSlot.end_time,
          available_capacity: capacity,
          price_override: priceOverride || null
        })
      })
    })

    const { data, error } = await supabase
      .from("host_availability")
      .insert(slots)
      .select()

    if (error) {
      console.error("Error creating bulk availability:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error creating bulk availability:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
