export interface UserProfile {
  id: string
  email: string
  user_type: "customer" | "business"
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface BusinessProfile {
  id: string // Matches auth user ID
  name: string // This will be the contact name
  email: string
  business_name?: string
  contact_name?: string
  phone?: string
  business_type?: string
  location?: string
  host_type: "captain" | "instructor" | "guide" | "company" | "individual_operator"
  onboarding_completed: boolean
  marketplace_enabled: boolean
}
