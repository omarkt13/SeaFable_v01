"use server" // Add this line to make the file a Server Action

import { createClient } from "@/lib/supabase/client"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getUserProfile } from "./auth-utils" // This will be updated below
import type { BusinessProfile } from "@/types/auth"
import type { HostProfile as SupabaseHostProfile } from "@/types/database"
import type { HostAvailability } from "@/types/business"

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
  }
  host_profiles?: {
    id: string
    name: string
    avatar_url?: string
  }
}

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

// Use server client for server-side operations
export function getServerSupabase() {
  return createSupabaseServerClient()
}

// Use client for client-side operations
export function getClientSupabase() {
  return createClient()
}

export async function signOutUser() {
  try {
    const supabase = getClientSupabase() // Use client-side client
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: "Network error occurred" }
  }
}

// Experience functions
export async function getExperiences(
  filters: {
    search?: string
    location?: string
    activityTypes?: string[]
    priceRange?: [number, number]
    difficultyLevels?: string[]
    minGuests?: number
    rating?: number
    sortBy?: string
    limit?: number
    offset?: number
  } = {},
) {
  try {
    const supabase = getServerSupabase() // Use server-side client

    let query = supabase
      .from("experiences")
      .select(`
        id,
        title,
        description,
        short_description,
        location,
        activity_type,
        duration_hours,
        max_guests,
        min_guests,
        price_per_person,
        difficulty_level,
        rating,
        total_reviews,
        primary_image_url,
        created_at,
        host_profiles!experiences_host_id_fkey (
          id,
          name,
          avatar_url,
          rating,
          total_reviews
        )
      `)
      .eq("is_active", true)

    // Apply filters with proper sanitization
    if (filters.search) {
      const sanitizedSearch = filters.search.replace(/[%_]/g, "\\$&").substring(0, 100)
      query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`)
    }

    if (filters.location) {
      const sanitizedLocation = filters.location.replace(/[%_]/g, "\\$&").substring(0, 100)
      query = query.ilike("location", `%${sanitizedLocation}%`)
    }

    if (filters.activityTypes?.length) {
      query = query.in("activity_type", filters.activityTypes)
    }

    if (filters.priceRange) {
      query = query.gte("price_per_person", filters.priceRange[0]).lte("price_per_person", filters.priceRange[1])
    }

    if (filters.difficultyLevels?.length) {
      query = query.in("difficulty_level", filters.difficultyLevels)
    }

    if (filters.minGuests) {
      query = query.gte("max_guests", filters.minGuests)
    }

    if (filters.rating) {
      query = query.gte("rating", filters.rating)
    }

    // Apply sorting
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
      case "popular":
        query = query.order("total_bookings", { ascending: false })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    // Apply pagination
    const limit = Math.min(filters.limit || 20, 100) // Cap at 100
    const offset = Math.max(filters.offset || 0, 0)
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching experiences:", error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    return {
      success: true,
      data: data || [],
      count: count || 0,
      hasMore: (count || 0) > offset + limit,
    }
  } catch (error) {
    console.error("Error in getExperiences:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      count: 0,
      hasMore: false,
    }
  }
}

export async function getExperienceById(id: string) {
  try {
    const supabase = getServerSupabase() // Use server-side client
    const { data, error } = await supabase
      .from("experiences")
      .select(`
        *,
        host_profiles!experiences_host_id_fkey (
          id,
          name,
          bio,
          avatar_url,
          rating,
          total_reviews,
          host_type,
          years_experience,
          certifications,
          specialties
        ),
        experience_images (
          image_url,
          alt_text,
          display_order
        ),
        reviews (
          id,
          rating,
          title,
          comment,
          created_at,
          users (
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching experience:", error)
      return { success: false, error: error.message, data: null }
    }

    // Fetch host availability separately as it's linked to host_profile_id
    const { data: availabilityData, error: availabilityError } = await supabase
      .from("host_availability")
      .select("*")
      .eq("host_profile_id", data.host_id)
      .gte("date", new Date().toISOString().split("T")[0]) // Only future dates
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (availabilityError) {
      console.error("Error fetching host availability:", availabilityError)
      // Don't fail the whole experience fetch if availability fails
    }

    return { success: true, data: { ...data, host_availability: availabilityData || [] } }
  } catch (error) {
    console.error("Error fetching experience:", error)
    return { success: false, error: "Network error occurred", data: null }
  }
}

// Get reviews for a specific experience
export async function getExperienceReviews(experienceId: string) {
  try {
    const supabase = getServerSupabase() // Use server-side client
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

// Get user bookings
export async function getUserBookings(userId: string) {
  try {
    const supabase = getServerSupabase() // Use server-side client
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences!bookings_experience_id_fkey (
          id,
          title,
          location,
          primary_image_url,
          duration_display,
          activity_type
        ),
        host_profiles!bookings_host_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq("user_id", userId)
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

// Get host bookings
export async function getHostBookings(hostId: string): Promise<Booking[]> {
  const supabase = getServerSupabase() // Use server-side client for this function
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        booking_status,
        number_of_guests,
        total_price,
        departure_time,
        special_requests,
        experiences ( id, title, primary_image_url, duration_display, activity_type ),
        users ( id, first_name, last_name, email, avatar_url )
      `)
      .eq("host_id", hostId)
      .order("booking_date", { ascending: true })

    if (error) {
      console.error("Error fetching host bookings:", error)
      throw new Error(error.message)
    }

    // Ensure data is an array, even if null or undefined
    return Array.isArray(data) ? data : []
  } catch (error: any) {
    console.error("Bookings error:", error.message)
    throw error
  }
}

// Get host earnings
export async function getHostEarnings(hostId: string) {
  const supabase = getServerSupabase() // Use server-side client for this function

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
export async function getHostDashboardData(hostId: string): Promise<{
  success: boolean
  error?: string
  data: BusinessDashboardData | null
}> {
  try {
    const supabase = getServerSupabase()

    // Use Promise.allSettled for better error handling
    const [hostProfileResult, experiencesResult, bookingsResult] = await Promise.allSettled([
      supabase.from("host_profiles").select("*").eq("id", hostId).single(),

      supabase
        .from("experiences")
        .select("id, title, is_active, rating, total_bookings, price_per_person")
        .eq("host_id", hostId),

      supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          booking_status,
          total_price,
          number_of_guests,
          booked_at,
          experiences!bookings_experience_id_fkey (
            id,
            title
          ),
          users!bookings_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("host_id", hostId)
        .order("booked_at", { ascending: false })
        .limit(100), // Limit to prevent memory issues
    ])

    // Handle results with proper error checking
    const hostProfile = hostProfileResult.status === "fulfilled" ? hostProfileResult.value.data : null

    const experiences = experiencesResult.status === "fulfilled" ? experiencesResult.value.data || [] : []

    const bookings = bookingsResult.status === "fulfilled" ? bookingsResult.value.data || [] : []

    if (!hostProfile) {
      throw new Error("Host profile not found")
    }

    // Calculate metrics efficiently
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const completedBookings = bookings.filter(
      (b) => b.booking_status === "completed" || b.booking_status === "confirmed",
    )

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
    const activeBookings = bookings.filter(
      (b) => b.booking_status === "confirmed" || b.booking_status === "pending",
    ).length

    const averageRating =
      experiences.length > 0 ? experiences.reduce((sum, exp) => sum + (exp.rating || 0), 0) / experiences.length : 0

    // Build dashboard data
    const dashboardData = {
      businessProfile: hostProfile,
      overview: {
        totalRevenue,
        activeBookings,
        totalExperiences: experiences.length,
        averageRating: Number.parseFloat(averageRating.toFixed(1)),
        revenueGrowth: 0, // Calculate based on historical data
        bookingGrowth: 0, // Calculate based on historical data
      },
      recentBookings: bookings.slice(0, 5).map((booking) => ({
        id: booking.id,
        customerName: `${booking.users?.first_name || "Unknown"} ${booking.users?.last_name || "User"}`,
        experienceTitle: booking.experiences?.title || "N/A",
        date: new Date(booking.booking_date).toLocaleDateString(),
        amount: booking.total_price || 0,
        guests: booking.number_of_guests || 1,
        avatar: booking.users?.avatar_url || "/placeholder.svg?height=40&width=40",
        status: booking.booking_status || "pending",
      })),
      experiences: experiences.map((exp) => ({
        id: exp.id,
        title: exp.title,
        status: exp.is_active ? ("active" as const) : ("inactive" as const),
        bookings: exp.total_bookings || 0,
        revenue: (exp.price_per_person || 0) * (exp.total_bookings || 0),
        rating: exp.rating || 0,
      })),
    }

    return { success: true, data: dashboardData }
  } catch (error) {
    console.error("Error fetching host dashboard data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    }
  }
}

// Get user dashboard data
export async function getUserDashboardData(userId: string) {
  try {
    const supabase = getServerSupabase() // Use server-side client

    // Get user profile using the centralized function from auth-utils
    const user = await getUserProfile(userId)

    if (!user) {
      console.error("Error fetching user: User profile not found for ID", userId)
      return { success: false, error: "User profile not found", data: null }
    }

    // Get user bookings
    const bookingsResult = await getUserBookings(userId)

    // Get user reviews
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select(`
    *,
    experiences!reviews_experience_id_fkey (title, primary_image_url)
  `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (reviewError) {
      console.error("Error fetching reviews:", reviewError)
    }

    return {
      success: true,
      data: {
        user,
        bookings: bookingsResult.data || [],
        reviews: reviews || [],
      },
    }
  } catch (error) {
    console.error("Error fetching user dashboard data:", error)
    return { success: false, error: "Network error occurred", data: null }
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
}) {
  try {
    const supabase = getServerSupabase() // Use server-side client
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
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: "Network error occurred", data: null }
  }
}

// Database connection test functions
export async function testDatabaseConnection() {
  try {
    const supabase = getServerSupabase() // Use server-side client
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Database connection successful" }
  } catch (error) {
    return { success: false, error: "Network error occurred" }
  }
}

export async function testTableAccess() {
  const supabase = getServerSupabase() // Use server-side client
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
    const supabase = getServerSupabase() // Use server-side client
    const [usersResult, experiencesResult, bookingsResult] = await Promise.all([
      supabase.from("users").select("*").limit(3),
      supabase.from("experiences").select("*, host_profiles(name)").limit(3),
      supabase.from("bookings").select("*, experiences(title), users(first_name, last_name)").limit(3),
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
  const supabase = getServerSupabase() // Use server-side client
  const hostProfileUpdates: Partial<
    Omit<
      BusinessProfile,
      | "onboarding_completed"
      | "marketplace_enabled"
      | "businessName"
      | "businessType"
      | "businessEmail"
      | "businessPhone"
      | "businessAddress"
      | "businessDescription"
      | "logo_url"
    >
  > = {}
  const hostBusinessSettingsUpdates: { onboarding_completed?: boolean; marketplace_enabled?: boolean } = {}

  // Distribute updates to the correct tables
  if (updates.contact_name !== undefined) hostProfileUpdates.contact_name = updates.contact_name
  if (updates.phone !== undefined) hostProfileUpdates.phone = updates.phone
  if (updates.location !== undefined) hostProfileUpdates.location = updates.location
  if (updates.business_type !== undefined) hostProfileUpdates.business_type = updates.business_type
  if (updates.name !== undefined) hostProfileUpdates.name = updates.name
  if (updates.business_name !== undefined) hostProfileUpdates.business_name = updates.business_name
  if (updates.logo_url !== undefined) hostProfileUpdates.logo_url = updates.logo_url

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
