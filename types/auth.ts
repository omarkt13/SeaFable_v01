export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  role: "user" | "host" | "admin"
  created_at: string
  updated_at: string
}

export interface BusinessProfile {
  id: string
  user_id?: string
  name: string
  bio?: string
  avatar_url?: string
  years_experience?: number
  certifications: string[]
  specialties: string[]
  rating: number
  total_reviews: number
  host_type: "captain" | "instructor" | "guide" | "company" | "individual_operator"
  languages_spoken: string[]
  business_name?: string
  contact_name?: string
  email?: string
  phone?: string
  business_type?: string
  location?: string
  description?: string
  business_registration_id?: string
  insurance_details?: string
  created_at: string
  updated_at: string
}
