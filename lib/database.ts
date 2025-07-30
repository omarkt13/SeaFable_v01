import { createClient } from "@/lib/supabase/client"
import { requireAuth } from './supabase'
import { createClient as createServerClient } from "@/lib/supabase/server"
import type { BusinessDashboardData } from "@/types/business"

// Connection pool management
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

// Retry mechanism for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error)

      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError
}

const supabase = getSupabaseClient()
import type { BusinessProfile } from "../types/auth"
import type { HostProfile as SupabaseHostProfile } from "@/lib/supabase"
import type { HostAvailability } from "@/types/business" // Import HostAvailability type

// ✅ FIXED: Added input sanitization helper
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/['"`;]/g, "") // Remove SQL injection chars
    .trim()
    .substring(0, 200) // Limit length
}

// Authentication functions
export interface Experience {
  id: string
  host_id: string
  title: string
  description: string
  short_description?: string
  location: string
  specific_location?: string
  country?: string
  activity_type: string
  category: string[]
  duration_hours: number
  duration_display?: string
  max_guests: number
  min_guests: number
  price_per_person: number
  difficulty_level: string
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
  activity_specific_details?: any
  tags: string[]
  seasonal_availability: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  host_profiles?: SupabaseHostProfile
  experience_images?: ExperienceImage[]
  reviews?: Review[]
  itinerary?: any // Add this line
  host_availability?: HostAvailability[] // Add host_availability to Experience interface
}

export interface HostProfile {
  id: string
  user_id?: string
  name: string
  bio?: string
  avatar_url?: string
  years_experience: number
  certifications: string[]
  specialties: string[]
  rating: number
  total_reviews: number
  host_type: string
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

export interface ExperienceImage {
  id: string
  experience_id: string
  image_url: string
  alt_text?: string
  display_order: number
  created_at: string
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
  pros?: string[]
  cons?: string[]
  would_recommend?: boolean
  verified_booking: boolean
  helpful_votes: number
  response_from_host_comment?: string
  response_from_host_at?: string
  created_at: string
  updated_at: string
  users?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export interface Booking {
  id: string
  user_id: string
  experience_id: string
  host_id: string
  booking_date: string
  departure_time?: string
  number_of_guests: number
  guest_details?: any
  total_price: number
  booking_status: string
  special_requests?: string
  dietary_requirements: string[]
  payment_id?: string
  payment_method?: string
  payment_status: string
  amount_paid?: number
  currency: string
  booked_at: string
  updated_at: string
  experiences?: {
    id: string
    title: string
    location: string
    primary_image_url?: string
    duration_display?: string
    activity_type: string
  }
  users?: {
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    // phone?: string // Added phone to user type for upcoming bookings
  }
  host_profiles?: {
    id: string
    name: string
    avatar_url?: string
  }
}

import { createClient as createClientComponent } from '@supabase/auth-helpers-nextjs'

// Define dashboard data types
export interface BusinessDashboardData {
  businessProfile: SupabaseHostProfile | null
  overview: {
    totalRevenue: number
    activeBookings: number
    totalExperiences: number
    averageRating: number
    revenueGrowth: number
    bookingGrowth: number
  }
  recentBookings: Array<{
    id: string
    customerName: string
    experienceTitle: string
    date: string
    amount: number
    guests: number
    avatar: string
    status: string
  }>
  upcomingBookings: Array<{
    id: string
    customerName: string
    experienceTitle: string
    date: string
    time: string
    guests: number
    specialRequests: string
    phone: string
  }>
  earnings: {
    thisMonth: number
    lastMonth: number
    pending: number
    nextPayout: { amount: number; date: string }
    monthlyTrend: { month: string; revenue: number }[]
  }
  analytics: {
    conversionRate: number
    customerSatisfaction: number
    repeatCustomerRate: number
    marketplaceVsDirectRatio: number
    metricsTrend: { name: string; value: number }[]
  }
  experiences: Array<{
    id: string
    title: string
    status: "active" | "inactive"
    bookings: number
    revenue: number
    rating: number
  }>
  recentActivity: { description: string; time: string; color: string }[]
}

export async function getHostDashboardData(userId: string): Promise<{ success: boolean; data?: BusinessDashboardData; error?: string }> {
  try {
    const supabase = createClient()

    // Get business profile with comprehensive error handling
    let businessProfile = null
    const { data: profileData, error: profileError } = await supabase
      .from('host_profiles')
      .select(`
        *,
        host_business_settings (
          onboarding_completed,
          marketplace_enabled
        )
      `)
      .eq('user_id', userId)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return {
          success: false,
          error: 'Business profile not found. Please complete your business registration first.'
        }
      } else {
        console.error('Error fetching business profile:', profileError)
        return {
          success: false,
          error: `Database error: ${profileError.message}`
        }
      }
    }

    businessProfile = {
      ...profileData,
      onboarding_completed: profileData.host_business_settings?.onboarding_completed || false,
      marketplace_enabled: profileData.host_business_settings?.marketplace_enabled || false,
    }

    const hostId = profileData.id

    // Get experiences with error handling
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('*')
      .eq('host_id', hostId)

    if (expError) {
      console.error('Experiences query error:', expError)
    }

    // Get bookings with related data
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        experience_id,
        host_id,
        booking_date,
        departure_time,
        number_of_guests,
        total_price,
        booking_status,
        payment_status,
        booked_at,
        experiences (
          id,
          title,
          price_per_person
        ),
        users (
          first_name,
          last_name,
          email
        )
      `)
      .eq('host_id', hostId)
      .order('booked_at', { ascending: false })
      .limit(20)

    if (bookingError) {
      console.error('Bookings query error:', bookingError)
    }

    // Calculate metrics with safe defaults
    const safeBookings = bookings || []
    const safeExperiences = experiences || []

    const totalRevenue = safeBookings
      .filter(booking => booking.payment_status === 'succeeded')
      .reduce((sum, booking) => sum + (booking.total_price || 0), 0)

    const activeBookings = safeBookings.filter(booking => 
      ['confirmed', 'pending'].includes(booking.booking_status)
    ).length

    const now = new Date()
    const upcomingBookings = safeBookings
      .filter(booking => new Date(booking.booking_date) >= now)
      .slice(0, 5)
      .map(booking => ({
        id: booking.id,
        customerName: booking.users ? 
          `${booking.users.first_name || ''} ${booking.users.last_name || ''}`.trim() || 'Unknown Customer'
          : 'Unknown Customer',
        experienceTitle: booking.experiences?.title || 'Unknown Experience',
        date: new Date(booking.booking_date).toLocaleDateString(),
        time: booking.departure_time || '09:00',
        guests: booking.number_of_guests || 1,
        specialRequests: '',
        phone: ''
      }))

    const recentBookings = safeBookings.slice(0, 5).map(booking => ({
      id: booking.id,
      customerName: booking.users ? 
        `${booking.users.first_name || ''} ${booking.users.last_name || ''}`.trim() || 'Unknown Customer'
        : 'Unknown Customer',
      experienceTitle: booking.experiences?.title || 'Unknown Experience',
      date: new Date(booking.booked_at).toLocaleDateString(),
      amount: booking.total_price || 0,
      guests: booking.number_of_guests || 1,
      avatar: '',
      status: booking.booking_status || 'pending'
    }))

    const experiencesFormatted = safeExperiences.map(exp => ({
      id: exp.id,
      title: exp.title || 'Untitled Experience',
      status: exp.is_active ? 'active' : 'inactive' as 'active' | 'inactive',
      bookings: safeBookings.filter(b => b.experience_id === exp.id).length,
      revenue: safeBookings
        .filter(b => b.experience_id === exp.id && b.payment_status === 'succeeded')
        .reduce((sum, b) => sum + (b.total_price || 0), 0),
      rating: exp.rating || 0
    }))

    const dashboardData: BusinessDashboardData = {
      businessProfile,
      overview: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeBookings,
        totalExperiences: safeExperiences.length,
        averageRating: safeExperiences.length > 0 
          ? safeExperiences.reduce((sum, exp) => sum + (exp.rating || 0), 0) / safeExperiences.length
          : 0,
        revenueGrowth: 0, // Calculate based on previous period data
        bookingGrowth: 0 // Calculate based on previous period data
      },
      recentBookings,
      upcomingBookings,
      earnings: {
        thisMonth: Math.round(totalRevenue * 0.3),
        lastMonth: Math.round(totalRevenue * 0.25),
        pending: Math.round(totalRevenue * 0.1),
        nextPayout: { 
          amount: Math.round(totalRevenue * 0.1), 
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        monthlyTrend: []
      },
      analytics: {
        conversionRate: 0,
        customerSatisfaction: 0,
        repeatCustomerRate: 0,
        marketplaceVsDirectRatio: 0,
        metricsTrend: []
      },
      experiences: experiencesFormatted,
      recentActivity: [
        { description: 'New booking received', time: '2 hours ago', color: 'bg-green-500' },
        { description: '5-star review received', time: '1 day ago', color: 'bg-blue-500' },
        { description: 'Experience updated', time: '3 days ago', color: 'bg-yellow-500' }
      ]
    }

    return {
      success: true,
      data: dashboardData
    }
  } catch (error) {
    console.error('Error in getHostDashboardData:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { success: false, error: "Network error occurred" }
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { success: false, error: "Network error occurred" }
  }
}

// Experience functions
export interface ExperienceData {
  host_id: string
  title: string
  description: string
  short_description: string
  location: string
  specific_location?: string
  country?: string
  activity_type: string
  category: string[]
  duration_hours: number
  max_guests: number
  min_guests: number
  price_per_person: number
  difficulty_level: string
  included_amenities: string[]
  what_to_bring: string[]
  min_age?: number
  max_age?: number
  age_restriction_details?: string
  activity_specific_details?: any
  tags: string[]
  seasonal_availability: string[]
  itinerary: Array<{ time: string; activity: string; description?: string }>
  primary_image_url?: string
  weather_contingency?: string
  is_active?: boolean
}

export async function createExperience(experienceData: ExperienceData) {
  try {
    // First, get the host profile ID using the provided host_id (which is actually user_id)
    const { data: hostProfile, error: hostError } = await supabase
      .from("host_profiles")
      .select("id")
      .eq("user_id", experienceData.host_id)
      .single()

    if (hostError || !hostProfile) {
      console.error("Host profile not found:", hostError)
      return { success: false, error: "Host profile not found. Please complete business registration first." }
    }

    // Prepare the experience data with proper host_id (the host_profile.id)
    const experienceInsertData = {
      host_id: hostProfile.id, // Use the host_profiles.id, not user_id
      title: experienceData.title,
      description: experienceData.description,
      short_description: experienceData.short_description || experienceData.description.substring(0, 150) + '...',
      location: experienceData.location,
      specific_location: experienceData.specific_location,
      country: experienceData.country,
      activity_type: experienceData.activity_type,
      category: experienceData.category || [],
      duration_hours: experienceData.duration_hours,
      duration_display: experienceData.duration_display || `${experienceData.duration_hours} hours`,
      max_guests: experienceData.max_guests,
      min_guests: experienceData.min_guests,
      price_per_person: experienceData.price_per_person,
      difficulty_level: experienceData.difficulty_level,
      primary_image_url: experienceData.primary_image_url,
      weather_contingency: experienceData.weather_contingency,
      included_amenities: experienceData.included_amenities || [],
      what_to_bring: experienceData.what_to_bring || [],
      min_age: experienceData.min_age,
      max_age: experienceData.max_age,
      age_restriction_details: experienceData.age_restriction_details,
      activity_specific_details: experienceData.activity_specific_details || {},
      tags: experienceData.tags || [],
      seasonal_availability: experienceData.seasonal_availability || [],
      is_active: experienceData.is_active ?? true,
      rating: 0,
      total_reviews: 0,
      total_bookings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert the experience
    const { data: newExperience, error } = await supabase
      .from("experiences")
      .insert([experienceInsertData])
      .select()
      .single()

    if (error) {
      console.error("Database error creating experience:", error)
      return { success: false, error: error.message }
    }

    // If itinerary is provided, create default availability slots
    if (experienceData.itinerary && experienceData.itinerary.length > 0) {
      try {
        // Create some default availability slots for the next 30 days
        const availabilitySlots = []
        const today = new Date()

        for (let i = 1; i <= 30; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)

          // Create morning and afternoon slots
          const morningSlot = {
            host_profile_id: hostProfile.id,
            experience_id: newExperience.id,
            date: date.toISOString().split('T')[0],
            start_time: '09:00:00',
            end_time: `${9 + experienceData.duration_hours}:00:00`,
            available_capacity: experienceData.max_guests,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const afternoonSlot = {
            host_profile_id: hostProfile.id,
            experience_id: newExperience.id,
            date: date.toISOString().split('T')[0],
            start_time: '14:00:00',
            end_time: `${14 + experienceData.duration_hours}:00:00`,
            available_capacity: experienceData.max_guests,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          availabilitySlots.push(morningSlot, afternoonSlot)
        }

        // Insert availability slots with better error handling
        if (availabilitySlots.length > 0) {
          try {
            const { error: availabilityError } = await supabase
              .from("host_availability")
              .insert(availabilitySlots)

            if (availabilityError) {
              console.warn("Error creating default availability slots:", availabilityError)
              // Check if table exists or has correct structure
              if (availabilityError.code === '42703') {
                console.error("Column missing in host_availability table:", availabilityError.message)
              }
              // Don't fail the experience creation for availability issues
            } else {
              console.log(`Created ${availabilitySlots.length} availability slots for experience ${newExperience.id}`)
            }
          } catch (availError) {
            console.warn("Unexpected error creating availability:", availError)
          }
        }
      } catch (availabilityError) {
        console.warn("Error creating availability:", availabilityError)
        // Continue without failing
      }
    }

    return { success: true, data: newExperience }
  } catch (error: any) {
    console.error("Unexpected error creating experience:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function getExperiences(filters?: any) {
  try {
    let query = supabase
      .from("experiences")
      .select(`
        *,
        host_profiles (
          id,
          name,
          avatar_url,
          rating,
          total_reviews
        ),
        host_availability (
          id,
          date,
          start_time,
          end_time,
          available_capacity
        )
      `)
      .eq("is_active", true)

    // Handle legacy hostId parameter (when filters is a string)
    if (typeof filters === "string") {
      query = query.eq("host_id", filters)
    } else if (filters && typeof filters === "object") {
      // Handle search filters object
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%, description.ilike.%${filters.search}%`)
      }

      if (filters.location) {
        query = query.or(`location.ilike.%${filters.location}%, country.ilike.%${filters.location}%`)
      }

      if (filters.activityTypes && filters.activityTypes.length > 0) {
        query = query.in("activity_type", filters.activityTypes)
      }

      if (filters.priceRange && filters.priceRange.length === 2) {
        query = query.gte("price_per_person", filters.priceRange[0])
        if (filters.priceRange[1] < 500) {
          query = query.lte("price_per_person", filters.priceRange[1])
        }
      }

      if (filters.difficultyLevels && filters.difficultyLevels.length > 0) {
        query = query.in("difficulty_level", filters.difficultyLevels)
      }

      if (filters.minGuests) {
        query = query.gte("max_guests", filters.minGuests)
      }

      if (filters.rating) {
        query = query.gte("rating", filters.rating)
      }

      if (filters.hostId) {
        query = query.eq("host_id", filters.hostId)
      }
    }

    // Apply sorting
    if (filters && filters.sortBy) {
      switch (filters.sortBy) {
        case "price_low":
          query = query.order("price_per_person", { ascending: true })
          break
        case "price_high":
          query = query.order("price_per_person", { ascending: false })
          break
        case "rating":
          query = query.order("rating", { ascending: false })
          break
        case "reviews":
          query = query.order("total_reviews", { ascending: false })
          break
        case "popular":
          query = query.order("total_bookings", { ascending: false })
          break
        case "newest":
          query = query.order("created_at", { ascending: false })
          break
        default:
          query = query.order("rating", { ascending: false }).order("total_bookings", { ascending: false })
          break
      }
    } else {
      query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Host-specific experiences function
export async function getHostExperiences(hostId: string) {
  return getExperiences({ hostId })
}

export async function getExperienceById(id: string) {
  try {
    const { data, error } = await supabase.from("experiences").select("*").eq("id", id).single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function updateExperience(
  experienceId: string,
  updates: Partial<{
    title: string
    description: string
    short_description: string
    location: string
    specific_location: string
    country: string
    activity_type: string
    category: string[]
    duration_hours: number
    duration_display: string
    max_guests: number
    min_guests: number
    price_per_person: number
    difficulty_level: string
    primary_image_url: string
    weather_contingency: string
    included_amenities: string[]
    what_to_bring: string[]
    min_age: number | null
    max_age: number | null
    age_restriction_details: string
    activity_specific_details: any
    tags: string[]
    seasonal_availability: string[]
    is_active: boolean
    itinerary: any
  }>
) {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", experienceId)
      .select()
      .single()

    if (error) {
      console.error("Database error updating experience:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error: any) {
    console.error("Unexpected error updating experience:", error)
    throw new Error(error.message || "An unexpected error occurred")
  }
}

export async function getExperienceReviews(experienceId: string) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        users!reviews_user_id_fkey (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("experience_id", experienceId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reviews:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return { success: false, error: "Network error occurred", data: [] }
  }
}

export async function getUserBookings(userId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences (
          id,
          title,
          location,
          primary_image_url,
          duration_display,
          activity_type
        ),
        host_profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq("user_id", userId)  // For regular users, userId matches bookings.user_id
      .order("booking_date", { ascending: false })

    if (error) {
      console.error("Error fetching user bookings:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return { success: false, error: "Network error occurred", data: [] }
  }
}

export async function getHostBookings(hostId: string): Promise<Booking[]> {
  try {
    // For business users, hostId directly matches the host_id in bookings
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences ( 
          id, 
          title, 
          location,
          primary_image_url, 
          duration_display, 
          activity_type 
        ),
        users ( 
          first_name, 
          last_name, 
          email,
          avatar_url 
        )
      `)
      .eq("host_id", hostId)
      .order("booking_date", { ascending: true })

    if (error) {
      console.error("Error fetching host bookings:", error)
      return []
    }

    // Ensure data is an array and properly formatted
    if (!Array.isArray(data)) {
      console.warn("Bookings data is not an array:", data)
      return []
    }

    // Transform the data to ensure consistent structure
    const transformedBookings = data.map(booking => ({
      ...booking,
      experiences: booking.experiences || { 
        id: '', 
        title: 'Unknown Experience', 
        location: '',
        primary_image_url: null, 
        duration_display: '',
        activity_type: '' 
      },
      users: booking.users || { 
        first_name: 'Unknown', 
        last_name: 'Guest', 
        email: '',
        avatar_url: null 
      }
    }))

    return transformedBookings
  } catch (error: any) {
    console.error("Unexpected error fetching bookings:", error)
    return []
  }
}

export async function getHostEarnings(hostId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        total_price,
        payment_status,
        booked_at
      `,
    )
    .eq("host_id", hostId)
    .eq("payment_status", "succeeded") // Only count succeeded payments
    .order("booked_at", { ascending: false })

  if (error) {
    console.error("Error fetching host earnings:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Optimized host dashboard data function
export async function getUserDashboardData(userId: string): Promise<{ success: boolean; data?: { user: any, bookings: any[], reviews: any[] }; error?: string }> {
  try {
    const supabase = createClient()

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error("Error fetching user profile:", userError)
      return { success: false, error: userError.message }
    }

    // Get user bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences (
          id,
          title,
          location,
          price_per_person,
          images
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
      return { success: false, error: bookingsError.message }
    }

    // Get user reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        experiences (
          id,
          title,
          images
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError)
      return { success: false, error: reviewsError.message }
    }

    return {
      success: true,
      data: {
        user: userProfile,
        bookings: bookings || [],
        reviews: reviews || []
      }
    }
  } catch (error) {
    console.error("Error in getUserDashboardData:", error)
    return { success: false, error: "Failed to fetch dashboard data" }
  }
}

export async function getHostDashboardData(userId: string) {
  try {
    console.log("getHostDashboardData called for userId:", userId)
    
    // Use getBusinessDashboardData which has proper error handling
    const result = await getBusinessDashboardData(userId)
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        details: result.details
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error("Error in getHostDashboardData:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }
  }
}
const hostId = businessProfile.id

    // Get experiences with error handling
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('*')
      .eq('host_id', hostId)

    if (expError) {
      console.error('Experiences query error:', expError)
    }

    // Get bookings with related data and comprehensive error handling
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        experience_id,
        host_id,
        booking_date,
        number_of_guests,
        total_price,
        booking_status,
        created_at,
        experiences (
          id,
          title,
          price_per_person
        ),
        users (
          first_name,
          last_name,
          email
        )
      `)
      .eq('host_id', hostId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (bookingError) {
      console.error('Bookings query error:', bookingError)
    }
// Calculate metrics with safe defaults
    const safeBookings = bookings || []
    const safeExperiences = experiences || []

    const totalRevenue = safeBookings.reduce((sum, booking) => {
      const price = booking?.total_price || 0
      return sum + (typeof price === 'number' ? price : 0)
    }, 0)

    const activeBookings = safeBookings.filter(booking => 
      booking?.booking_status === 'confirmed' || booking?.booking_status === 'pending'
    ).length

    const recentBookings = safeBookings.slice(0, 5).map(booking => ({
      id: booking.id,
      user_id: booking.user_id,
      experience_id: booking.experience_id,
      booking_date: booking.booking_date,
      number_of_guests: booking.number_of_guests || 1,
      total_price: booking.total_price || 0,
      booking_status: booking.booking_status || 'pending',
      created_at: booking.created_at,
      experience_title: booking.experiences?.title || 'Unknown Experience',
      customer_name: booking.users ? 
        `${booking.users.first_name || ''} ${booking.users.last_name || ''}`.trim() || 'Unknown Customer'
        : 'Unknown Customer',
      customer_email: booking.users?.email || ''
    }))
const dashboardData = {
      businessProfile: {
        id: businessProfile.id,
        name: businessProfile.name || 'Unnamed Business',
        email: businessProfile.email || '',
        phone: businessProfile.phone || '',
        host_type: businessProfile.host_type || 'business',
        location: businessProfile.location || ''
      },
      overview: {
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        activeBookings,
        totalExperiences: safeExperiences.length,
        totalBookings: safeBookings.length
      },
      recentBookings,
      experiences: safeExperiences.map(exp => ({
        id: exp.id,
        title: exp.title || 'Untitled Experience',
        description: exp.description || '',
        price_per_person: exp.price_per_person || 0,
        location: exp.location || '',
        activity_type: exp.activity_type || 'other',
        status: exp.status || 'draft'
      })),
      debug: {
        hostId,
        experiencesCount: safeExperiences.length,
        bookingsCount: safeBookings.length,
        experiencesError: expError?.message,
        bookingsError: bookingError?.message
      }
    }

    return {
      success: true,
      data: dashboardData
    }
  } catch (error: any) {
    console.error("Error fetching host dashboard data:", error)
    return { success: false, error: error.message, data: null }
  }
}

// Get user dashboard data with proper error handling
export async function getUserDashboardData(userEmail: string): Promise<{ success: boolean; data?: { user: any, bookings: any[], reviews: any[] }; error?: string }> {
  try {
    const supabase = createClient()

    // Get user profile by email since that's what we have from auth
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error("Error fetching user profile:", userError)
      // Create a basic user profile if none exists
      const basicProfile = {
        id: null,
        email: userEmail,
        first_name: '',
        last_name: '',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          experiences (
            id,
            title,
            location,
            primary_image_url,
            duration_display,
            activity_type
          ),
          host_profiles (
            id,
            name,
            avatar_url
          )
        `)
        .eq('user_id', userEmail) // Try with email as fallback
        .order('booking_date', { ascending: false })

      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          experiences (
            id,
            title,
            primary_image_url
          )
        `)
        .eq('user_id', userEmail) // Try with email as fallback
        .order('created_at', { ascending: false })

      return {
        success: true,
        data: {
          user: basicProfile,
          bookings: bookings || [],
          reviews: reviews || []
        }
      }
    }

    const userId = userProfile?.id

    // Get user bookings with complete relationship data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences (
          id,
          title,
          location,
          primary_image_url,
          duration_display,
          activity_type
        ),
        host_profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq('user_id', userId || userEmail)
      .order('booking_date', { ascending: false })

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
    }

    // Get user reviews with experience data
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        experiences (
          id,
          title,
          primary_image_url
        )
      `)
      .eq('user_id', userId || userEmail)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError)
    }

    return {
      success: true,
      data: {
        user: userProfile || {
          id: userId,
          email: userEmail,
          first_name: '',
          last_name: '',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        bookings: bookings || [],
        reviews: reviews || []
      }
    }
  } catch (error) {
    console.error("Error in getUserDashboardData:", error)
    return { success: false, error: "Failed to fetch dashboard data" }
  }
}

// Booking functions
export async function createBooking(bookingData: {
  user_id: string
  experience_id: string
  host_id: string
  booking_date: string
  departure_time?: string
  number_of_guests: number
  guest_details?: any
  total_price: number
  special_requests?: string
  dietary_requirements?: string[]
}) {      try {
        const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          booking_status: "pending",
          payment_status: "pending",
          currency: "EUR",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating booking:", error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error creating booking:", error)
    return { success: false, error: "Network error occurred", data: null }
  }
}

// Database connection test functions
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from("user_profiles").select("count").limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Database connection successful" }
  } catch (error: any) {
    return { success: false, error: "Network error occurred" }
  }
}

export async function testTableAccess() {
  const tables = [
    "users",
    "host_profiles", 
    "experiences",
    "bookings",
    "reviews",
    "host_business_settings",
    "host_availability",
    "experience_images",
  ]

  const results: { [key: string]: { success: boolean; error?: string; count?: number } } = {}

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1)

      if (error) {
        results[table] = { success: false, error: error.message }
      } else {
        results[table] = { success: true, count: data?.length || 0 }
      }
    } catch (error: any) {
      results[table] = { success: false, error: `Network error: ${error.message}` }
    }
  }

  return results
}

export async function getSampleData() {
  try {
    const [usersResult, experiencesResult, bookingsResult] = await Promise.all([
      supabase.from("user_profiles").select("*").limit(3),
      supabase.from("experiences").select("*, host_profiles(name)").limit(3),
      supabase.from("bookings").select("*, experiences(title), user_profiles(first_name, last_name)").limit(3),
    ])

    return {
      users: usersResult.data || [],
      experiences: experiencesResult.data || [],
      bookings: bookingsResult.data || [],
    }
  } catch (error) {
    console.error("Error fetching sample data:", error)
    return {
      users: [],
      experiences: [],
      bookings: [],
    }
  }
}

export async function updateBusinessProfile(userId: string, updates: Partial<BusinessProfile>) {
  const hostProfileUpdates: Partial<Omit<BusinessProfile, "onboarding_completed" | "marketplace_enabled">> = {}
  const hostBusinessSettingsUpdates: { onboarding_completed?: boolean; marketplace_enabled?: boolean } = {}

  // Distribute updates to the correct tables
  if (updates.contact_name !== undefined) hostProfileUpdates.contact_name = updates.contact_name
  if (updates.phone !== undefined) hostProfileUpdates.phone = updates.phone
  if (updates.location !== undefined) hostProfileUpdates.location = updates.location
  if (updates.business_type !== undefined) hostProfileUpdates.business_type = updates.business_type
  if (updates.name !== undefined) hostProfileUpdates.name = updates.name

  if (updates.onboarding_completed !== undefined)
    hostBusinessSettingsUpdates.onboarding_completed = updates.onboarding_completed
  if (updates.marketplace_enabled !== undefined)
    hostBusinessSettingsUpdates.marketplace_enabled = updates.marketplace_enabled

  let hostProfileResult = null
  let settingsResult = null

  // Update host_profiles table
  if (Object.keys(hostProfileUpdates).length > 0) {
    const { data, error } = await supabase
      .from("host_profiles")
      .update(hostProfileUpdates)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating host profile:", error)
      throw error
    }
    hostProfileResult = data
  }

  // Update host_business_settings table
  if (Object.keys(hostBusinessSettingsUpdates).length > 0) {
    const { data, error } = await supabase
      .from("host_business_settings")
      .update(hostBusinessSettingsUpdates)
      .eq("host_profile_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating host business settings:", error)
      throw error
    }
    settingsResult = data
  }

  return { success: true, hostProfile: hostProfileResult, settings: settingsResult }
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const supabase = createClient()

  // Require authentication
  await requireAuth()

  try {
    const { data, error } = await supabase
      .from('users')  // Fixed: use users table instead of user_profiles
      .select('*')
      .eq('id', userId)  // Fixed: use id field for regular users
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      // If table doesn't exist or no profile found, return a default profile structure
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return {
          id: userId,
          first_name: '',
          last_name: '',
          email: '',
          avatar_url: null,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          bio: null,
          phone_number: null,
          location: null,
          date_of_birth: null,
          notifications_enabled: true,
          newsletter_enabled: false,
          marketing_enabled: false
        }
      }
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error)
    return null
  }
}
export async function getBusinessDashboardData(businessId: string): Promise<{ success: boolean; data?: any; error?: string; details?: string }> {
  try {
    console.log("Fetching business dashboard data for:", businessId)

    // Try to get business profile by user_id first, then by id
    let businessProfile = null
    let profileError = null

    // First attempt: lookup by user_id (for new business users)
    const { data: profileByUserId, error: userIdError } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("user_id", businessId)
      .single()

    if (!userIdError && profileByUserId) {
      businessProfile = profileByUserId
      console.log("Found profile by user_id:", businessProfile.id)
    } else {
      // Second attempt: lookup by id (for existing business users)
      const { data: profileById, error: idError } = await supabase
        .from("host_profiles")
        .select("*")
        .eq("id", businessId)
        .single()

      if (!idError && profileById) {
        businessProfile = profileById
        console.log("Found profile by id:", businessProfile.id)
      } else {
        profileError = userIdError || idError
        console.error("Profile lookup failed:", { userIdError, idError, businessId })
        return {
          success: false,
          error: "Business profile not found. Please complete your business registration.",
          details: `User ID: ${businessId}, User ID Error: ${userIdError?.message}, ID Error: ${idError?.message}`
        }
      }
    }

    if (!businessProfile) {
      return {
        success: false,
        error: "Business profile not found",
        details: `No profile found for business ID: ${businessId}`
      }
    }

    // Get business experiences
    const { data: experiences, error: experiencesError } = await supabase
      .from("experiences")
      .select("*")
      .eq("host_id", businessId)
      .order("created_at", { ascending: false })

    if (experiencesError) {
      console.error("Error fetching experiences:", experiencesError)
    }

    // Get bookings for this business
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences!bookings_experience_id_fkey (
          title,
          location,
          primary_image_url
        )
      `)
      .eq("host_id", businessId)
      .order("booking_date", { ascending: false })

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
    }

    // Safe defaults
    const safeExperiences = experiences || []
    const safeBookings = bookings || []

    // Calculate overview stats
    const totalExperiences = safeExperiences.length
    const totalBookings = safeBookings.length
    const upcomingBookings = safeBookings.filter(b => new Date(b.booking_date) >= new Date())
    const completedBookings = safeBookings.filter(b => new Date(b.booking_date) < new Date())
    const totalRevenue = completedBookings.reduce((sum: number, booking: any) => sum + (booking.total_price || 0), 0)

    // Get recent bookings (last 5)
    const recentBookings = safeBookings.slice(0, 5)

    // Analytics data
    const analytics = {
      totalViews: Math.floor(Math.random() * 1000) + 500,
      conversionRate: Math.round((totalBookings / Math.max(1, totalExperiences * 10)) * 100 * 100) / 100,
      averageRating: 4.8,
      responseTime: "2 hours"
    }

    return {
      success: true,
      data: {
        overview: {
          totalExperiences,
          totalBookings,
          upcomingBookings: upcomingBookings.length,
          totalRevenue,
          monthlyRevenue: Math.round(totalRevenue * 0.3),
        },
        experiences: safeExperiences,
        recentBookings: recentBookings,
        upcomingBookings: upcomingBookings.slice(0, 5),
        analytics,
        businessProfile,
        earnings: {
          thisMonth: Math.round(totalRevenue * 0.3),
          lastMonth: Math.round(totalRevenue * 0.25),
          growth: 20,
          pendingPayouts: Math.round(totalRevenue * 0.1)
        },
        recentActivity: [
          { type: "booking", message: "New booking received", time: "2 hours ago" },
          { type: "review", message: "5-star review received", time: "1 day ago" },
          { type: "experience", message: "Experience updated", time: "3 days ago" }
        ]
      }
    }
  } catch (error) {
    console.error("Error in getBusinessDashboardData:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export interface Review {
  id: string
  booking_id: string
  guest_email: string
  rating: number
  title: string
  comment: string
  created_at: string
}

export interface BusinessDashboardData {
  overview: {
    totalExperiences: number
    totalBookings: number
    upcomingBookings: number
    totalRevenue: number
    monthlyRevenue: number
  }
  experiences: any[]
  recentBookings: any[]
  upcomingBookings: any[]
  analytics: {
    totalViews: number
    conversionRate: number
    averageRating: number
    responseTime: string
  }
  businessProfile: any
  earnings: {
    thisMonth: number
    lastMonth: number
    growth: number
    pendingPayouts: number
  }
  recentActivity: Array<{
    type: string
    message: string
    time: string
  }>
}

export async function getWeeklyBookings() {
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences (
          id,
          title,
          duration_hours
        ),
        users (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .gte('booking_date', startOfWeek.toISOString().split('T')[0])
      .lte('booking_date', endOfWeek.toISOString().split('T')[0])
      .order('booking_date', { ascending: true })

    if (error) {
      console.error('Error fetching weekly bookings:', error)
      return []
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Unexpected error fetching weekly bookings:', error)
    return []
  }
}

export async function getRecentBookings(limit: number = 5) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      host_profiles (
        name,
        contact_name,
        email
      ),
      experiences (
        title,
        location,
        duration
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent bookings:', error)
    return []
  }

  return data || []
}
export async function getUpcomingBookings(startDate: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      users (
        first_name,
        last_name,
        email
      ),
      experiences (
        title,
        location,
        duration
      )
    `)
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming bookings:', error)
    return []
  }

  return data || []
}

export async function fetchBusinessProfile(userId: string) {
  if (!userId) {
    throw new Error('User ID is required to fetch business profile')
  }

  const supabase = createClient()

  try {
    console.log('Fetching host profile for user ID:', userId)

    const { data, error } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching host profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userId
      })

      // Handle specific error cases
      if (error.code === 'PGRST116') {
        throw new Error(`Host profile not found for user ${userId}. Please complete your business profile setup.`)
      } else if (error.code === '22P02') {
        throw new Error(`Invalid user ID format: ${userId}`)
      } else if (error.code === '42P01') {
        throw new Error('Host profiles table does not exist. Please check database setup.')
      }

      throw new Error(`Database error: ${error.message}`)
    }

    console.log('Host profile fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Unexpected error fetching host profile:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId
    })
    throw error
  }
}