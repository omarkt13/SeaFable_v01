import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { UserProfile, BusinessProfile } from "@/types/auth"

declare global {
  var supabaseClientInstance: ReturnType<typeof createClientComponentClient> | undefined
}

export const supabase = (() => {
  if (!globalThis.supabaseClientInstance) {
    globalThis.supabaseClientInstance = createClientComponentClient()
  }
  return globalThis.supabaseClientInstance
})()

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error || !session) return null
  return session
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error || !data) return null
  return data
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
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

  if (error || !data) return null

  return {
    ...data,
    onboarding_completed: data.host_business_settings?.onboarding_completed || false,
    marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
  }
}

export async function determineUserType(userId: string): Promise<"customer" | "business" | null> {
  // Check business profile first
  const businessProfile = await getBusinessProfile(userId)
  if (businessProfile) return "business"

  // Check user profile
  const userProfile = await getUserProfile(userId)
  if (userProfile) return "customer"

  return null
}

export async function isBusinessUser(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from("host_profiles").select("id").eq("id", userId).single()
  return !error && !!data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
}
