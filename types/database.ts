// Database types for SeaFable application

export type Booking = {
  id: string
  user_id: string
  experience_id: string
  host_id: string
  booking_date: string
  booking_status: "pending" | "confirmed" | "cancelled" | "completed"
  number_of_guests: number
  total_price: number
  departure_time: string
  special_requests?: string
  dietary_requirements?: string
  created_at: string
  updated_at: string
  // Joined data
  experiences?: {
    id: string
    title: string
    primary_image_url?: string
    duration_display?: string
    activity_type?: string
  }
  users?: {
    id: string
    first_name?: string
    last_name?: string
    email: string
    phone?: string
  }
}

export type UserProfile = {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type ExperienceData = {
  host_id: string
  business_id: string
  title: string
  short_description: string
  description: string
  location: string
  price: number
  duration: number
  duration_hours: number
  category: string
  activity_type: string
  activity_specific_details: Record<string, any>
  difficulty_level: string
  max_guests: number
  min_age?: number
  equipment_provided: string[]
  what_to_bring: string[]
  cancellation_policy: string
  weather_dependency: boolean
  instant_booking: boolean
  tags: string[]
  highlights: string[]
  included_services: string[]
  excluded_services: string[]
  itinerary: {
    title: string
    description: string
    duration?: number
    order: number
  }[]
}
