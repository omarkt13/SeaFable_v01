import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { UserProfile, BusinessProfile } from "@/types/auth"

// Use globalThis to ensure a single instance across the entire client-side application.
// This is robust against hot module reloading in development.
declare global {
  // eslint-disable-next-line no-var
  var supabaseClientInstance: ReturnType<typeof createClientComponentClient> | undefined
}

export const supabase = (() => {
  if (typeof window === 'undefined') {
    // Server-side: create a new instance each time
    return createClientComponentClient()
  }

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
  if (error) {
    console.error("Error getting session:", error)
    return null
  }
  return session
}



export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error || !data) return null
  return data as unknown as UserProfile
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
    .eq("user_id", userId)
    .single()

  if (error) {
    console.error("Error fetching business profile:", error);
    // If profile doesn't exist, return null instead of throwing
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  // Type assertion to handle the complex joined data structure
  const businessData = data as any

  return {
    ...businessData,
    onboarding_completed: businessData.host_business_settings?.onboarding_completed || false,
    marketplace_enabled: businessData.host_business_settings?.marketplace_enabled || false,
  }
}

export async function createBusinessProfile(userId: string, email: string, businessName: string, hostType: string) {
  // Insert into host_profiles first
  const { data: hostProfileData, error: hostProfileError } = await supabase
    .from("host_profiles")
    .insert([
      {
        id: userId,
        email: email,
        business_name: businessName,
        host_type: hostType,
        name: businessName, // Use businessName as default for 'name'
      },
    ])
    .select()
    .single()

  if (hostProfileError) {
    console.error("Error creating host profile:", hostProfileError)
    throw hostProfileError
  }

  // Then insert into host_business_settings
  const { data: settingsData, error: settingsError } = await supabase
    .from("host_business_settings")
    .insert([
      {
        host_profile_id: userId, // Link to the host_profile
        onboarding_completed: false,
        marketplace_enabled: false,
      },
    ])
    .select()
    .single()

  if (settingsError) {
    console.error("Error creating host business settings:", settingsError)
    // Consider rolling back host_profiles entry if settings creation fails
    throw settingsError
  }

  return { ...hostProfileData, host_business_settings: settingsData }
}

export async function determineUserType(userId: string): Promise<"customer" | "business" | null> {
  // First, try to get user metadata if available (faster)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (user && user.user_metadata?.user_type) {
    return user.user_metadata.user_type as "customer" | "business"
  }

  // Fallback to database checks if metadata is not set or user is not found
  const businessProfile = await getBusinessProfile(userId)
  if (businessProfile) return "business"

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

export async function signOutAndRedirect(userType: "customer" | "business") {
  await signOut()

  if (userType === "business") {
    window.location.href = "/business/login"
  } else {
    window.location.href = "/login"
  }
}