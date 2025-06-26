import { createSupabaseServerClient } from "@/lib/supabase/server" // Corrected import path
import { cookies } from "next/headers" // Import cookies
import { redirect } from "next/navigation"
import type { UserProfile, BusinessProfile } from "@/types/auth"

// Server-side Supabase client
// Modified to get cookieStore and pass it
const getSupabaseServer = () => {
  const cookieStore = cookies()
  return createSupabaseServerClient(cookieStore)
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabaseServer = getSupabaseServer() // Use the function to get the client
    const { data, error } = await supabaseServer.from("users").select("*").eq("id", userId).single()
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
    const supabaseServer = getSupabaseServer() // Use the function to get the client
    const { data, error } = await supabaseServer
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
      console.error("Error fetching business profile (server):", error)
      return null
    }

    const profile = {
      ...data,
      onboarding_completed: data.host_business_settings?.onboarding_completed || false,
      marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
    }
    return profile as BusinessProfile
  } catch (error) {
    console.error("Network error fetching business profile (server):", error)
    return null
  }
}

export async function signOutAndRedirect(redirectTo = "/login") {
  const supabaseServer = getSupabaseServer() // Use the function to get the client
  const { error } = await supabaseServer.auth.signOut()
  if (error) {
    console.error("Error signing out (server):", error)
    // Handle error, maybe show a toast or log
  }
  redirect(redirectTo)
}

export async function getSessionAndUser() {
  const supabaseServer = getSupabaseServer() // Use the function to get the client
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

  // Check if user is a business host
  const supabaseServer = getSupabaseServer() // Use the function to get the client
  const { data: businessProfile, error: businessError } = await supabaseServer
    .from("host_profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (businessError && businessError.code !== "PGRST116") {
    // PGRST116 means no rows found
    console.error("Error checking business profile:", businessError)
  }

  if (businessProfile) {
    return "business"
  }

  // If not a business, assume customer
  return "customer"
}
