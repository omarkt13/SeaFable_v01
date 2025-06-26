import { supabase } from "@/lib/supabase"

export async function getBusinessProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("host_profiles").select("*").eq("id", userId).single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error fetching business profile:", error)
    return { data: null, error }
  }
}

export async function getHostExperiences(hostId: string) {
  try {
    const { data, error } = await supabase.from("experiences").select("*").eq("host_id", hostId).eq("is_active", true)

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error("Error fetching host experiences:", error)
    return { data: [], error }
  }
}

export async function getHostBookings(hostId: string) {
  try {
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
        payment_status,
        users!bookings_user_id_fkey(
          first_name,
          last_name,
          email
        ),
        experiences!bookings_experience_id_fkey(
          title
        )
      `)
      .eq("host_id", hostId)
      .order("booking_date", { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error("Error fetching host bookings:", error)
    return { data: [], error }
  }
}

export async function getHostAvailability(hostId: string, startDate?: string, endDate?: string) {
  try {
    let query = supabase.from("host_availability").select("*").eq("host_id", hostId)

    if (startDate) {
      query = query.gte("date", startDate)
    }
    if (endDate) {
      query = query.lte("date", endDate)
    }

    const { data, error } = await query.order("date", { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error("Error fetching host availability:", error)
    return { data: [], error }
  }
}
