import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
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
    const { data, error } = await supabase
      .from("experiences")
      .insert([
        {
          ...experienceData,
          is_active: true,
          rating: 0,
          total_reviews: 0,
          total_bookings: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

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

export async function getExperiences(filters?: any) {
  try {
    let query = supabase
      .from("experiences")
      .select(`
        *,
        host_profiles!experiences_host_id_fkey (
          id,
          name,
          avatar_url,
          rating,
          total_reviews
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

export async function getHostBookings(hostId: string): Promise<Booking[]> {
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
      throw new Error(error.message)
    }

    // Ensure data is an array, even if null or undefined
    return Array.isArray(data) ? data : []
  } catch (error: any) {
    console.error("Bookings error:", error.message)
    throw error
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
      .eq('customer_id', userId)
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
      .eq('customer_id', userId)
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

export async function getHostDashboardData(userId: string): Promise<{
  success: boolean
  error?: string
  data: BusinessDashboardData | null
}> {
  try {
    // 1. Get Host Profile
    const { data: hostProfile, error: hostError } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (hostError) {
      console.error("Error fetching host profile:", hostError)
      return { success: false, error: hostError.message, data: null }
    }

    // 2. Get Experiences with booking counts
    const { data: experiences, error: expError } = await supabase.from("experiences").select("*").eq("host_id", userId)

    if (expError) {
      console.error("Error fetching experiences:", expError)
    }
    const experiencesData = experiences || []

    // 3. Get All Bookings with related data
    const { data: allBookings, error: bookingsError } = await supabase
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
        users!bookings_user_id_fkey (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("host_id", userId)
      .order("booked_at", { ascending: false }) // Already correct, no change needed here

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
    }
    const bookingsData = allBookings || []

    // Calculate overview statistics
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = new Date(currentYear, currentMonth - 1, 1)

    // Total revenue from completed/confirmed bookings
    const totalRevenue = bookingsData
      .filter((b) => b.booking_status === "completed" || b.booking_status === "confirmed")
      .reduce((sum: number, b: any) => sum + (b?.total_price || 0), 0)

    // Active bookings (confirmed or pending)
    const activeBookings = bookingsData.filter(
      (b) => b.booking_status === "confirmed" || b.booking_status === "pending",
    ).length

    // Average rating from experiences
    const averageRating =
      experiencesData.length > 0
        ? experiencesData.reduce((sum: number, exp: any) => sum + (exp?.rating || 0), 0) / experiencesData.length
        : 0

    // Monthly revenue calculations
    const thisMonthRevenue = bookingsData
      .filter((b) => {
        const bookingDate = new Date(b.booked_at)
        return (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear &&
          (b.booking_status === "completed" || b.booking_status === "confirmed")
        )
      })
      .reduce((sum: number, b: any) => sum + (b?.total_price || 0), 0)

    const lastMonthRevenue = bookingsData
      .filter((b) => {
        const bookingDate = new Date(b.booked_at)
        return (
          bookingDate.getMonth() === lastMonth.getMonth() &&
          bookingDate.getFullYear() === lastMonth.getFullYear() &&
          (b.booking_status === "completed" || b.booking_status === "confirmed")
        )
      })
      .reduce((sum: number, b: any) => sum + (b?.total_price || 0), 0)

    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    // Monthly booking growth
    const thisMonthBookings = bookingsData.filter((b) => {
      const bookingDate = new Date(b.booking_date)
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
    }).length

    const lastMonthBookings = bookingsData.filter((b) => {
      const bookingDate = new Date(b.booking_date)
      return bookingDate.getMonth() === lastMonth.getMonth() && bookingDate.getFullYear() === lastMonth.getFullYear()
    }).length

    const bookingGrowth =
      lastMonthBookings > 0 ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 : 0

    // Recent bookings (last 5)
    const recentBookings = bookingsData.slice(0, 5).map((booking) => ({
      id: booking.id,
      customerName: `${booking.users?.first_name || "Unknown"} ${booking.users?.last_name || "User"}`,
      experienceTitle: booking.experiences?.title || "N/A",
      date: new Date(booking.booking_date).toLocaleDateString(),
      amount: booking.total_price || 0,
      guests: booking.number_of_guests || 1,
      avatar: booking.users?.avatar_url || "/placeholder.svg?height=40&width=40",
      status: booking.booking_status || "pending",
    }))

    // Upcoming bookings (future dates, next 5)
    const nowTimestamp = Date.now()
    const upcomingBookings = bookingsData
      .filter((b) => new Date(b.booking_date).getTime() > nowTimestamp)
      .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
      .slice(0, 5)
      .map((booking) => ({
        ...booking,
        customerName: `${booking.users?.first_name || "Unknown"} ${booking.users?.last_name || "User"}`,
        experienceTitle: booking.experiences?.title || "N/A",
        date: new Date(booking.booking_date).toLocaleDateString(),
        time: booking.departure_time || "N/A",
        guests: booking.number_of_guests || 1,
        specialRequests: booking.special_requests || "",
        phone: booking.users?.phone || "N/A", // This will now correctly be 'N/A' if phone is not in users table
      }))

    // Earnings calculations
    const pendingEarnings = bookingsData
      .filter((b) => b.payment_status === "pending")
      .reduce((sum: number, b: any) => sum + (b?.total_price || 0), 0)

    // Generate monthly trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthRevenue = bookingsData
        .filter((b) => {
          const bookingDate = new Date(b.booked_at)
          return (
            bookingDate.getMonth() === date.getMonth() &&
            bookingDate.getFullYear() === date.getFullYear() &&
            (b.booking_status === "completed" || b.booking_status === "confirmed")
          )
        })
        .reduce((sum: number, b: any) => sum + (b?.total_price || 0), 0)

      monthlyTrend.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: monthRevenue,
      })
    }

    // Experience performance
    const experiencePerformance = experiencesData.map((exp) => {
      const expBookings = bookingsData.filter((b) => b.experience_id === exp.id)
      const expRevenue = expBookings
        .filter((b) => b.booking_status === "completed" || b.booking_status === "confirmed")
        .reduce((sum: number, b: any) => sum + (b?.total_price || 0), 0)

      return {
        id: exp.id,
        title: exp.title,
        status: exp.is_active ? ("active" as const) : ("inactive" as const),
        bookings: expBookings.length,
        revenue: expRevenue,
        rating: exp.rating || 0,
      }
    })

    // Recent activity
    const recentActivity = [
      ...bookingsData.slice(0, 3).map((b) => ({
        description: `New booking for ${b.experiences?.title || "an experience"} by ${b.users?.first_name || "a customer"}`,
        time: `${Math.floor((now.getTime() - new Date(b.booked_at).getTime()) / (1000 * 60 * 60))} hours ago`,
        color: "bg-green-500",
      })),
      ...experiencesData.slice(0, 2).map((exp) => ({
        description: `Experience "${exp.title}" ${exp.is_active ? "activated" : "updated"}`,
        time: `${Math.floor((now.getTime() - new Date(exp.updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
        color: "bg-blue-500",
      })),
    ].slice(0, 5)

    // Analytics (simplified calculations)
    const totalViews = experiencesData.reduce((sum, exp) => sum + (exp.total_reviews || 0), 0)
    const conversionRate = totalViews > 0 ? (bookingsData.length / totalViews) * 100 : 0

    const allReviews = experiencesData.filter((exp) => exp.total_reviews > 0)
    const customerSatisfaction =
      allReviews.length > 0
        ? (allReviews.reduce((sum: number, exp: any) => sum + (exp?.rating || 0), 0) / allReviews.length) * 20 // Convert to percentage
        : 0

    const uniqueCustomers = new Set(bookingsData.map((b) => b.user_id)).size
    const repeatCustomers = bookingsData.length - uniqueCustomers
    const repeatCustomerRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0

    const dashboardData: BusinessDashboardData = {
      businessProfile: hostProfile,
      overview: {
        totalRevenue,
        activeBookings,
        totalExperiences: experiencesData.length,
        averageRating: Number.parseFloat(averageRating.toFixed(1)),
        revenueGrowth: Number.parseFloat(revenueGrowth.toFixed(1)),
        bookingGrowth: Number.parseFloat(bookingGrowth.toFixed(1)),
      },
      recentBookings,
      upcomingBookings,
      earnings: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        pending: pendingEarnings,
        nextPayout: {
          amount: pendingEarnings,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        },
        monthlyTrend,
      },
      analytics: {
        conversionRate: Number.parseFloat(conversionRate.toFixed(1)),
        customerSatisfaction: Number.parseFloat(customerSatisfaction.toFixed(1)),
        repeatCustomerRate: Number.parseFloat(repeatCustomerRate.toFixed(1)),
        marketplaceVsDirectRatio: 75, // Placeholder
        metricsTrend: [
          { name: "Bookings", value: bookingsData.length },
          { name: "Revenue", value: totalRevenue / 1000 }, // In thousands
          { name: "Experiences", value: experiencesData.length },
          { name: "Rating", value: averageRating * 20 }, // Convert to percentage
        ],
      },
      experiences: experiencePerformance,
      recentActivity,
    }

    return { success: true, data: dashboardData }
  } catch (error: any) {
    console.error("Error fetching host dashboard data:", error)
    return { success: false, error: error.message, data: null }
  }
}

// Get user dashboard data
export async function getUserDashboardDataOriginal(userId: string) {
  try {
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
    const { data, error } = await supabase.from("users").select("count").limit(1)

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
async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}
export async function getBusinessDashboardData(businessId: string) {
  try {
    console.log("Fetching business dashboard data for:", businessId)

    // Get business profile
    const { data: businessProfile, error: profileError } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("id", businessId)
      .single()

    if (profileError) {
      console.error("Error fetching business profile:", profileError)
      throw profileError
    }

    // Get business experiences
    const { data: experiences, error: experiencesError } = await supabase
      .from("experiences")
      .select("*")
      .eq("host_id", businessId)
      .order("created_at", { ascending: false })

    if (experiencesError) {
      console.error("Error fetching experiences:", experiencesError)
      throw experiencesError
    }

    // Get bookings for this business
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences:experience_id (
          title,
          location,
          primary_image_url
        )
      `)
      .eq("host_id", businessId)
      .order("booking_date", { ascending: false })

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
      throw bookingsError
    }

    // Calculate overview stats
    const totalExperiences = experiences?.length || 0
    const totalBookings = bookings?.length || 0
    const upcomingBookings = bookings?.filter(b => new Date(b.booking_date) >= new Date()) || []
    const completedBookings = bookings?.filter(b => new Date(b.booking_date) < new Date()) || []
    const totalRevenue = completedBookings.reduce((sum: number, booking: any) => sum + (booking.total_price || 0), 0)

    // Get recent bookings (last 5)
    const recentBookings = bookings?.slice(0, 5) || []

    // Mock analytics data for now
    const analytics = {
      totalViews: Math.floor(Math.random() * 1000) + 500,
      conversionRate: Math.round((totalBookings / Math.max(1, totalExperiences * 10)) * 100 * 100) / 100,
      averageRating: 4.8,
      responseTime: "2 hours"
    }

    return {
      overview: {
        totalExperiences,
        totalBookings,
        upcomingBookings: upcomingBookings.length,
        totalRevenue,
        monthlyRevenue: Math.round(totalRevenue * 0.3), // Mock 30% of total as monthly
      },
      experiences: experiences || [],
      recentBookings: recentBookings,
      upcomingBookings: upcomingBookings.slice(0, 5),
      analytics,
      businessProfile,
      earnings: {
        thisMonth: Math.round(totalRevenue * 0.3),
        lastMonth: Math.round(totalRevenue * 0.25),
        growth: 20, // Mock growth percentage
        pendingPayouts: Math.round(totalRevenue * 0.1)
      },
      recentActivity: [
        { type: "booking", message: "New booking received", time: "2 hours ago" },
        { type: "review", message: "5-star review received", time: "1 day ago" },
        { type: "experience", message: "Experience updated", time: "3 days ago" }
      ]
    }
  } catch (error) {
    console.error("Error in getBusinessDashboardData:", error)
    throw error
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