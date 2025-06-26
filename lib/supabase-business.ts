import { supabase } from "@/lib/supabase"

export async function getBusinessProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("host_profiles")
      .select(`
        *,
        host_business_settings (
          onboarding_completed,
          marketplace_enabled
        )
      `)
      .eq("id", userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching business profile:", error)
    throw error
  }
}

export async function getHostExperiences(hostId: string) {
  try {
    const { data, error } = await supabase.from("experiences").select("*").eq("host_id", hostId)

    if (error) throw error
    return data
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
        *,
        users (
          first_name,
          last_name,
          phone
        ),
        experiences (
          title
        )
      `)
      .eq("host_id", hostId)

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching host bookings:", error)
    throw error
  }
}
