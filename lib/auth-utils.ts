import { createSupabaseServerClient } from "@/lib/supabase/server" // Corrected import path
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { UserProfile, BusinessProfile } from "@/types/auth" // Fixed import path

// Server-side Supabase client
const getSupabaseServer = () => {
  const cookieStore = cookies()
  return createSupabaseServerClient(cookieStore)
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabaseServer = getSupabaseServer()
    const { data, error } = await supabaseServer.from("users").select("*").eq("id", userId).maybeSingle()
    if (error) {
      console.error("Error fetching user profile (server):", error)
      return null
    }
    return data as UserProfile
  } catch (error) {
    console.error("Network error fetching user profile (server):", error)
    return null
  }
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  try {
    const supabaseServer = getSupabaseServer()
    const { data, error } = await supabaseServer
      .from("host_profiles")
      .select(`
        *,
        host_business_settings (
          onboarding_completed,
          marketplace_enabled
        )
      `)
      .eq("user_id", userId) // Ensure it's user_id
      .maybeSingle()

    if (error) {
      console.error("Error fetching business profile (server):", error)
      return null
    }

    const profile = data
      ? {
          ...data,
          onboarding_completed: data.host_business_settings?.onboarding_completed || false,
          marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
        }
      : null
    return profile as BusinessProfile
  } catch (error) {
    console.error("Network error fetching business profile (server):", error)
    return null
  }
}

export async function signOutAndRedirect(redirectTo = "/login") {
  const supabaseServer = getSupabaseServer()
  const { error } = await supabaseServer.auth.signOut()
  if (error) {
    console.error("Error signing out (server):", error)
  }
  redirect(redirectTo)
}

export async function getSessionAndUser() {
  const supabaseServer = getSupabaseServer()
  const {
    data: { session },
    error,
  } = await supabaseServer.auth.getSession()

  if (error) {
    console.error("Error getting session (server):", error)
    return { session: null, user: null }
  }

  return { session, user: session?.user || null }
}

export async function getAuthenticatedUserType(): Promise<"customer" | "business" | null> {
  const { user } = await getSessionAndUser()
  if (!user) return null

  const businessProfile = await getBusinessProfile(user.id) // Use the getBusinessProfile function
  if (businessProfile) {
    return "business"
  }

  return "customer"
}
