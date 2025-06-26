import { supabase } from "@/lib/supabase"

export async function getBusinessProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("host_profiles").select("*").eq("user_id", userId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching business profile:", error)
    throw error
  }
}

export async function getHostExperiences(hostId: string) {
  try {
    const { data, error } = await supabase.from("experiences").select("*").eq("host_id", hostId).eq("is_active", true)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching host experiences:", error)
    throw error
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
        created_at,
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
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching host bookings:", error)
    throw error
  }
}
