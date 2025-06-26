import { supabase } from "@/lib/supabase"
import type { UserProfile, BusinessProfile } from "@/types/auth"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
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

    if (error) {
      console.error("Error fetching business profile:", error)
      return null
    }

    // Flatten the business settings
    const profile: BusinessProfile = {
      ...data,
      onboarding_completed: data.host_business_settings?.onboarding_completed || false,
      marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
    }

    return profile
  } catch (error) {
    console.error("Error fetching business profile:", error)
    return null
  }
}

export async function isBusinessUser(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("host_profiles").select("id").eq("id", userId).single()

    return !error && !!data
  } catch (error) {
    return false
  }
}
