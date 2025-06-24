import type { User } from "@supabase/supabase-js"

export type BusinessProfile = {
  id: string
  user_id: string
  business_name: string
  contact_email: string
  phone_number?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  website?: string
  description?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export type Experience = {
  id: string
  host_id: string
  title: string
  description: string
  location: string
  price: number
  duration: number // in minutes or hours, define unit
  itinerary?: ItineraryItem[] // New field
  created_at: string
  updated_at: string
}

export type ItineraryItem = {
  id?: string // Optional for new items before saving
  title: string
  description: string
}

export type AvailabilitySlot = {
  id?: string // Optional for new slots before saving
  available_date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
  capacity: number
  price_override?: number | null
}

export type Booking = {
  id: string
  experience_id: string
  customer_id: string
  booked_at: string
  booking_date: string
  start_time: string
  end_time: string
  num_guests: number
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes?: string
  created_at: string
  updated_at: string
}

export type TeamMember = {
  id: string
  business_id: string
  user_id: string
  role: "admin" | "manager" | "staff"
  created_at: string
  updated_at: string
  user?: User // Joined user data
}
