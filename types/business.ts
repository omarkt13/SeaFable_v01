export interface HostProfile {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  business_name?: string
  business_type?: string
  location?: string
  description?: string
  avatar_url?: string
  website_url?: string
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface BusinessSettings {
  host_profile_id: string
  onboarding_completed: boolean
  marketplace_enabled: boolean
  auto_accept_bookings: boolean
  require_approval: boolean
  booking_lead_time: number
  cancellation_policy: string
  refund_policy: string
  terms_and_conditions?: string
  privacy_policy?: string
  notifications_enabled: boolean
  email_notifications: boolean
  sms_notifications: boolean
  calendar_sync_enabled: boolean
  calendar_provider?: string
  calendar_url?: string
  payment_methods: string[]
  default_currency: string
  tax_rate?: number
  stripe_account_id?: string
  paypal_account?: string
  created_at: string
  updated_at: string
}

export interface HostAvailability {
  id?: string
  host_profile_id: string
  experience_id?: string
  date: string
  startTime: string
  endTime: string
  availableCapacity: number
  priceOverride?: number
  notes?: string
  weatherDependent?: boolean
  isRecurring?: boolean
  recurringPattern?: string
  created_at?: string
  updated_at?: string
}

export interface BusinessDashboardData {
  businessProfile: any
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

export interface WeeklyBooking {
  id: string
  customerName: string
  experienceTitle: string
  time: string
  duration: string
  guests: number
  status: 'confirmed' | 'pending' | 'cancelled'
  phone?: string
  email?: string
  specialRequests?: string
}