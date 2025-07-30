import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClientComponentClient({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
})

// Helper function to ensure authentication
export const getAuthenticatedSupabase = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return supabase
}

// Helper function to require authentication
export const requireAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

// Also export as default for compatibility
export default supabase

// Database types based on the schema
export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
  role: "user" | "host" | "admin"
  created_at: string
  updated_at: string
}

export interface HostProfile {
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

export interface Experience {
  id: string
  host_id: string
  title: string
  description?: string
  short_description?: string
  location?: string
  specific_location?: string
  country?: string
  activity_type: string
  category: string[]
  duration_hours: number
  duration_display?: string
  max_guests: number
  min_guests: number
  price_per_person: number
  difficulty_level: "beginner" | "intermediate" | "advanced" | "all_levels"
  rating: number
  total_reviews: number
  total_bookings: number
  primary_image_url?: string
  weather_contingency?: string
  included_amenities: string[]
  what_to_bring: string[]
  min_age?: number
  max_age?: number
  age_restriction_details?: string
  activity_specific_details: any
  tags: string[]
  seasonal_availability: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  host_profiles?: HostProfile
  experience_images?: ExperienceImage[]
}

export interface ExperienceImage {
  id: string
  experience_id: string
  image_url: string
  alt_text?: string
  display_order: number
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  experience_id: string
  host_id: string
  booking_date: string
  departure_time?: string
  number_of_guests: number
  guest_details: any
  total_price: number
  booking_status: "pending" | "confirmed" | "cancelled_user" | "cancelled_host" | "completed" | "rescheduled"
  special_requests?: string
  dietary_requirements: string[]
  payment_id?: string
  payment_method?: string
  payment_status: "pending" | "succeeded" | "failed" | "refunded"
  amount_paid?: number
  currency: string
  booked_at: string
  updated_at: string
  experiences?: Experience
  users?: User
  host_profiles?: HostProfile
}

export interface Review {
  id: string
  booking_id: string
  user_id: string
  experience_id: string
  host_id: string
  rating: number
  title?: string
  comment?: string
  pros: string[]
  cons: string[]
  would_recommend?: boolean
  verified_booking: boolean
  helpful_votes: number
  response_from_host_comment?: string
  response_from_host_at?: string
  created_at: string
  updated_at: string
  users?: User
  experiences?: Experience
}