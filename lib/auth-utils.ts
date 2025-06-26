import { supabase } from "@/lib/supabase" // Correct import for client-side supabase
import type { UserProfile, BusinessProfile } from "@/types/auth"

export async function getCurrentUser() {
  if (!supabase) {
    console.error("Supabase client is not initialized in getCurrentUser.")
    return null
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getSession() {
  if (!supabase) {
    console.error("Supabase client is not initialized in getSession.")
    return null
  }
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error || !session) return null
  return session
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    console.error("Supabase client is not initialized in getUserProfile.")
    return null
  }
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error.message)
    return null
  }
  return data as UserProfile
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  if (!supabase) {
    console.error("Supabase client is not initialized in getBusinessProfile.")
    return null
  }
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
    console.error("Error fetching business profile:", error.message)
    return null
  }

  const businessProfileData = data as BusinessProfile
  return {
    ...businessProfileData,
    onboarding_completed: businessProfileData.host_business_settings?.onboarding_completed || false,
    marketplace_enabled: businessProfileData.host_business_settings?.marketplace_enabled || false,
  }
}

export async function createBusinessProfile(userId: string, email: string, businessName: string, hostType: string) {
  if (!supabase) {
    console.error("Supabase client is not initialized in createBusinessProfile.")
    throw new Error("Supabase client not initialized.")
  }
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
  if (!supabase) {
    console.error("Supabase client is not initialized in determineUserType.")
    return null
  }
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
  if (!supabase) {
    console.error("Supabase client is not initialized in isBusinessUser.")
    return false
  }
  const { data, error } = await supabase.from("host_profiles").select("id").eq("id", userId).single()

  return !error && !!data
}

export async function signOut() {
  if (!supabase) {
    console.error("Supabase client is not initialized in signOut.")
    return { error: new Error("Supabase client not initialized.") }
  }
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
  return { error: null } // Return null error on success
}

export async function signOutAndRedirect(userType: "customer" | "business") {
  await signOut()

  if (userType === "business") {
    window.location.href = "/business/login"
  } else {
    window.location.href = "/login"
  }
}

// Re-export supabase for convenience if other files need it directly from auth-utils
export { supabase }
