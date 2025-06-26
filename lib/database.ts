"use server" // Add this line to make the file a Server Action

import { supabase } from "@/lib/supabase"
import { createSupabaseServerClient } from "@/lib/supabase/server" // Correct import
import { cookies } from "next/headers" // Import cookies
import type { BusinessProfile, UserProfile } from "@/types/auth"
import type { Booking as UserBookingType, Experience as HostExperienceType } from "@/types/business"

// ✅ FIXED: Added input sanitization helper
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/['"`;]/g, "") // Remove SQL injection chars
    .trim()
    .substring(0, 200) // Limit length
}

// Authentication functions
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
  host_business_settings?: {
    onboarding_completed: boolean
    marketplace_enabled: boolean
  }
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

// Define dashboard data types
export interface BusinessDashboardData {
  businessProfile: any | null
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
  const cookieStore = cookies() // Get cookieStore here
  return createSupabaseServerClient(cookieStore) // Pass it to the client creator
}

// Use client for client-side operations
export function getClientSupabase() {
  return supabase // Use the main supabase client
}

export async function signOutUser() {
  try {
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
  searchQuery?: string,
  minPrice?: number,
  maxPrice?: number,
): Promise<{ data: HostExperienceType[] | null; error: string | null }> {
  try {
    let query = supabase.from("experiences").select("*")

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`)
    }
    if (minPrice !== undefined) {
      query = query.gte("price", minPrice)
    }
    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching experiences:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error("Exception fetching experiences:", err)
    return { data: null, error: err.message || "An unexpected error occurred" }
  }
}

export async function getExperienceById(
  id: string,
): Promise<{ data: HostExperienceType | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from("experiences").select("*").eq("id", id).maybeSingle()

    if (error) {
      console.error("Error fetching experience by ID:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error("Exception fetching experience by ID:", err)
    return { data: null, error: err.message || "An unexpected error occurred" }
  }
}

// Get reviews for a specific experience
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

// Get user bookings
export async function getUserBookings(userId: string) {
  try {
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
export async function getHostBookings(hostId: string): Promise<UserBookingType[]> {
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

    // If user profile is not found, return a success with null user and empty arrays
    // This allows the dashboard to render with fallback data (e.g., user email)
    if (!user) {
      console.warn("User profile not found for ID", userId, ". Returning partial dashboard data.")
      return {
        success: true,
        data: {
          user: null, // Explicitly null
          bookings: [],
          reviews: [],
        },
      }
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
  experience_id: string
  user_id: string
  business_id: string
  booking_date: string
  status: string
}): Promise<{ data: UserBookingType | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from("bookings").insert([bookingData]).select().single()

    if (error) {
      console.error("Error creating booking:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error("Exception creating booking:", err)
    return { data: null, error: err.message || "An unexpected error occurred" }
  }
}

// Database connection test functions
export async function testDatabaseConnection() {
  try {
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

export async function getBusinessProfile(
  userId: string,
): Promise<{ data: BusinessProfile | null; error: string | null }> {
  try {
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
      .maybeSingle()

    if (error) {
      console.error("Error fetching business profile:", error)
      return { data: null, error: error.message }
    }

    if (!data) {
      return { data: null, error: "Business profile not found" }
    }

    const profile: BusinessProfile = {
      ...data,
      onboarding_completed: data.host_business_settings?.onboarding_completed || false,
      marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
    }

    return { data: profile, error: null }
  } catch (err: any) {
    console.error("Exception fetching business profile:", err)
    return { data: null, error: err.message || "An unexpected error occurred" }
  }
}

export async function getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

    if (error) {
      console.error("Error fetching user profile:", error)
      return { data: null, error: error.message }
    }

    if (!data) {
      return { data: null, error: "User profile not found" }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error("Exception fetching user profile:", err)
    return { data: null, error: err.message || "An unexpected error occurred" }
  }
}

export async function getBusinessBookings(
  businessId: string,
): Promise<{ data: UserBookingType[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences (
          name,
          price
        ),
        users (
          full_name,
          email,
          phone
        )
      `)
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }) // Order by created_at
      .limit(10)

    if (error) {
      console.error("Error fetching business bookings:", error)
      return { data: null, error: error.message }
    }

    const bookings: UserBookingType[] = data.map((booking: any) => ({
      id: booking.id,
      experience_id: booking.experience_id,
      user_id: booking.user_id,
      business_id: booking.business_id,
      booking_date: booking.booking_date,
      status: booking.status,
      created_at: booking.created_at, // Ensure created_at is included
      experience_name: booking.experiences?.name || "N/A",
      experience_price: booking.experiences?.price || 0,
      customer_name: booking.users?.full_name || "N/A",
      customer_email: booking.users?.email || "N/A",
      customer_phone: booking.users?.phone || "N/A",
    }))

    return { data: bookings, error: null }
  } catch (err: any) {
    console.error("Exception fetching business bookings:", err)
    return { data: null, error: err.message || "An unexpected error occurred" }
  }
}

export async function getBusinessExperiences(
  businessId: string,
): Promise<{ data: HostExperienceType[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from("experiences").select("*").eq("business_id", businessId)

    if (error) {
      console.error("Error fetching business experiences:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err: any) {
    console.error("Exception fetching business experiences:", err)
    return { data: null, error: err.message || "An unexpected error occurred" }
  }
}

export async function getBusinessStats(businessId: string): Promise<{ data: any | null; error: string | null }> {
  try {
    // Fetch total bookings
    const { count: totalBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*", { count: "exact" })
      .eq("business_id", businessId)

    if (bookingsError) {
      console.error("Error fetching total bookings:", bookingsError)
      return { data: null, error: bookingsError.message }
    }

    // Fetch total revenue (sum of experience prices from bookings)
    const { data: revenueData, error: revenueError } = await supabase
      .from("bookings")
      .select("experiences(price)")
      .eq("business_id", businessId)

    if (revenueError) {
      console.error("Error fetching revenue:", revenueError)
      return { data: null, error: revenueError.message }
    }

    const totalRevenue = revenueData.reduce((sum, booking) => sum + (booking.experiences?.price || 0), 0)

    // Fetch total experiences
    const { count: totalExperiences, error: experiencesError } = await supabase
      .from("experiences")
      .select("*", { count: "exact" })
      .eq("business_id", businessId)

    if (experiencesError) {
      console.error("Error fetching total experiences:", experiencesError)
      return { data: null, error: experiencesError.message }
    }

    // Fetch total clients (distinct users who have booked)
    const { count: totalClients, error: clientsError } = await supabase
      .from("bookings")
      .select("user_id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .neq("user_id", null) // Ensure user_id is not null for distinct count

    if (clientsError) {
      console.error("Error fetching total clients:", clientsError)
      return { data: null, error: clientsError.message }
    }

    return {
      data: {
        totalBookings,
        totalRevenue,
        totalExperiences,
        totalClients,
      },
      error: null,
    }
  } catch (err: any) {
    console.error("Exception fetching business stats:", err)
    return { data: null, error: err.message || "An unexpected error occurred" }
  }
}
