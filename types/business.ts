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

// Enhanced Experience type with activity expansion from v3
export type Experience = {
  id: string
  host_id: string
  business_id: string
  title: string
  description: string
  location: string
  price: number
  duration: number // in minutes
  itinerary?: ItineraryItem[]
  
  // New activity-specific fields from v3
  activityType: 'sailing' | 'surfing' | 'kayaking' | 'diving' | 'jet-skiing' | 
                'fishing' | 'whale-watching' | 'paddleboarding' | 'windsurfing' | 'snorkeling'
  activitySpecificDetails: Record<string, any> // JSONB equivalent for activity-specific data
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  maxParticipants: number
  minAge?: number
  equipmentProvided: string[]
  whatToBring: string[]
  cancellationPolicy: string
  weatherDependency: boolean
  instantBooking: boolean
  
  // Enhanced metadata
  tags: string[]
  highlights: string[]
  includedServices: string[]
  excludedServices: string[]
  
  created_at: string
  updated_at: string
}

export type ItineraryItem = {
  id?: string // Optional for new items before saving
  title: string
  description: string
  duration?: number // in minutes
  order: number
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

// Enhanced TeamMember to support multiple host roles
export type TeamMember = {
  id: string
  business_id: string
  user_id: string
  role: "admin" | "manager" | "staff"
  created_at: string
  updated_at: string
  user?: User // Joined user data
}

// New HostProfile type (renamed from CaptainProfile)
export type HostProfile = {
  id: string
  business_id: string
  name: string
  role: 'captain' | 'instructor' | 'guide' | 'operator'
  specializations: string[]
  certifications: string[]
  yearsExperience: number
  languages: string[]
  bio: string
  avatar_url?: string
  contact_email?: string
  phone_number?: string
  emergency_contact?: string
  created_at: string
  updated_at: string
}

// New Equipment type
export type Equipment = {
  id: string
  business_id: string
  name: string
  category: 'safety' | 'activity' | 'comfort' | 'navigation'
  description: string
  quantity: number
  condition: 'excellent' | 'good' | 'fair' | 'needs_replacement'
  last_maintenance?: string
  created_at: string
  updated_at: string
}

// New Certification type
export type Certification = {
  id: string
  name: string
  issuing_authority: string
  description: string
  validity_period?: number // in months
  category: 'safety' | 'instruction' | 'navigation' | 'specialized'
  created_at: string
  updated_at: string
}

// Activity-specific data types
export type SailingDetails = {
  boatType: 'sailboat' | 'catamaran' | 'yacht' | 'dinghy'
  boatLength: number // in feet
  maxWindSpeed: number // in knots
  sailingArea: string
  licenseRequired: boolean
}

export type DivingDetails = {
  diveType: 'scuba' | 'snorkeling' | 'freediving'
  maxDepth: number // in meters
  certificationRequired: boolean
  equipmentIncluded: boolean
  diveSites: string[]
}

export type SurfingDetails = {
  surfType: 'beginner' | 'intermediate' | 'advanced'
  boardType: 'longboard' | 'shortboard' | 'foam' | 'provided'
  waveHeight: string
  lessonIncluded: boolean
}

export type FishingDetails = {
  fishingType: 'deep_sea' | 'inshore' | 'fly_fishing' | 'spearfishing'
  targetSpecies: string[]
  equipmentProvided: boolean
  licenseIncluded: boolean
  catchAndRelease: boolean
}

// FIXED HostAvailability type - matches what the code expects
export type HostAvailability = {
  id: string
  host_id: string
  business_id?: string
  // These are the properties the code actually expects:
  date: string  // YYYY-MM-DD (code expects this, not available_date)
  available_date?: string // Keep for backward compatibility
  start_time: string // HH:MM
  end_time: string // HH:MM
  available_capacity: number // Code expects this, not max_capacity
  max_capacity?: number // Keep for backward compatibility
  current_bookings?: number
  price_override?: number
  is_available?: boolean
  weather_dependent?: boolean
  is_recurring?: boolean
  recurring_pattern?: any
  notes?: string
  created_at: string
  updated_at: string
}

// BusinessSettings type for business configuration
export type BusinessSettings = {
  id: string
  business_id: string
  onboarding_completed: boolean
  marketplace_enabled: boolean
  auto_booking_enabled: boolean
  instant_booking_enabled: boolean
  cancellation_policy: string
  refund_policy: string
  contact_preferences: {
    email: boolean
    phone: boolean
    sms: boolean
  }
  notification_settings: {
    new_bookings: boolean
    cancellations: boolean
    reviews: boolean
    payments: boolean
  }
  created_at: string
  updated_at: string
}
