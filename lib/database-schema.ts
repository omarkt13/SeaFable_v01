
/**
 * SeaFable Database Schema Reference
 * This file contains TypeScript interfaces that match the database schema
 */

// Core Tables

export interface User {
  id: string; // UUID PRIMARY KEY
  first_name: string;
  last_name: string;
  email: string; // UNIQUE
  password_hash?: string; // For demo users only
  avatar_url?: string;
  role: 'user' | 'host' | 'admin';
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface HostProfile {
  id: string; // UUID PRIMARY KEY - Matches Supabase Auth user ID
  user_id?: string; // UUID REFERENCES users(id) - Nullable for demo compatibility
  name: string;
  bio?: string;
  avatar_url?: string;
  years_experience?: number;
  certifications: string[];
  specialties: string[];
  rating: number; // NUMERIC(2,1) DEFAULT 0.0
  total_reviews: number;
  host_type: 'captain' | 'instructor' | 'guide' | 'company' | 'individual_operator';
  languages_spoken: string[];
  
  // Business registration fields
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  business_type?: string;
  location?: string;
  description?: string;
  business_registration_id?: string;
  insurance_details?: string;
  
  created_at: string;
  updated_at: string;
}

// Business Management Tables

export interface HostBusinessSettings {
  id: string;
  host_profile_id: string; // UNIQUE REFERENCES host_profiles(id)
  business_email?: string;
  business_phone?: string;
  website_url?: string;
  social_media_links: Record<string, any>;
  operating_license?: string;
  insurance_policy_number?: string;
  tax_id?: string;
  bank_account_info: Record<string, any>;
  notification_preferences: {
    emailBookings: boolean;
    smsReminders: boolean;
    weatherAlerts: boolean;
    marketingEmails: boolean;
  };
  subscription_tier: 'free' | 'pro' | 'enterprise';
  onboarding_completed: boolean;
  onboarding_step: number;
  marketplace_enabled: boolean;
  auto_accept_bookings: boolean;
  created_at: string;
  updated_at: string;
}

export interface HostAvailability {
  id: string;
  host_profile_id: string; // REFERENCES host_profiles(id)
  date: string; // DATE
  start_time?: string; // TIME
  end_time?: string; // TIME
  available_capacity: number;
  price_override?: number;
  notes?: string;
  weather_dependent: boolean;
  is_recurring: boolean;
  recurring_pattern: Record<string, any>;
  created_at: string;
}

export interface HostTeamMember {
  id: string;
  host_profile_id: string; // REFERENCES host_profiles(id)
  user_id: string; // REFERENCES users(id)
  role: 'captain' | 'instructor' | 'crew' | 'admin' | 'assistant';
  permissions: string[];
  hourly_rate?: number;
  commission_rate?: number;
  certifications: string[];
  hire_date: string; // DATE
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Experience & Booking Tables

export interface Experience {
  id: string;
  host_id: string; // REFERENCES host_profiles(id)
  title: string;
  description?: string;
  short_description?: string;
  location?: string;
  specific_location?: string;
  country?: string;
  activity_type: string;
  category: string[];
  duration_hours: number;
  duration_display?: string;
  max_guests: number;
  min_guests: number;
  price_per_person: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  rating: number;
  total_reviews: number;
  total_bookings: number;
  primary_image_url?: string;
  weather_contingency?: string;
  included_amenities: string[];
  what_to_bring: string[];
  min_age?: number;
  max_age?: number;
  age_restriction_details?: string;
  activity_specific_details: Record<string, any>;
  tags: string[];
  seasonal_availability: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExperienceImage {
  id: string;
  experience_id: string; // REFERENCES experiences(id)
  image_url: string;
  alt_text?: string;
  display_order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string; // REFERENCES users(id)
  experience_id: string; // REFERENCES experiences(id)
  host_id: string; // REFERENCES host_profiles(id)
  booking_date: string; // DATE
  departure_time?: string; // TIME
  number_of_guests: number;
  guest_details: Record<string, any>;
  total_price: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled_user' | 'cancelled_host' | 'completed' | 'rescheduled';
  special_requests?: string;
  dietary_requirements: string[];
  payment_id?: string;
  payment_method?: string;
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  amount_paid?: number;
  currency: string;
  booked_at: string; // TIMESTAMPTZ
  updated_at: string;
}

// Review & Financial Tables

export interface Review {
  id: string;
  booking_id: string; // UNIQUE REFERENCES bookings(id)
  user_id: string; // REFERENCES users(id)
  experience_id: string; // REFERENCES experiences(id)
  host_id: string; // REFERENCES host_profiles(id)
  rating: number; // 1-5
  title?: string;
  comment?: string;
  pros: string[];
  cons: string[];
  would_recommend?: boolean;
  verified_booking: boolean;
  helpful_votes: number;
  response_from_host_comment?: string;
  response_from_host_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HostEarnings {
  id: string;
  host_profile_id: string; // REFERENCES host_profiles(id)
  booking_id?: string; // REFERENCES bookings(id)
  gross_amount: number;
  platform_fee: number;
  payment_processing_fee: number;
  net_amount: number;
  currency: string;
  payout_date?: string; // DATE
  payout_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  stripe_transfer_id?: string;
  transaction_id?: string;
  fee_percentage: number;
  created_at: string;
}

// Analytics Table

export interface HostAnalytics {
  id: string;
  host_profile_id: string; // REFERENCES host_profiles(id)
  date: string; // DATE
  total_bookings: number;
  total_revenue: number;
  total_guests: number;
  average_rating?: number;
  cancellation_rate: number;
  repeat_customer_rate: number;
  marketplace_bookings: number;
  direct_bookings: number;
  weather_cancellations: number;
  created_at: string;
}

// System Tables

export interface SchemaMigration {
  version: string; // PRIMARY KEY
  applied_at: string; // TIMESTAMPTZ
}

// Extended types with relations for queries

export interface BookingWithRelations extends Booking {
  experiences?: Pick<Experience, 'id' | 'title' | 'location' | 'primary_image_url' | 'duration_display' | 'activity_type'>;
  users?: Pick<User, 'first_name' | 'last_name' | 'email' | 'avatar_url'>;
  host_profiles?: Pick<HostProfile, 'id' | 'name' | 'avatar_url'>;
}

export interface ExperienceWithRelations extends Experience {
  host_profiles?: HostProfile;
  experience_images?: ExperienceImage[];
  reviews?: ReviewWithRelations[];
}

export interface ReviewWithRelations extends Review {
  users?: Pick<User, 'first_name' | 'last_name' | 'avatar_url'>;
  experiences?: Pick<Experience, 'title' | 'primary_image_url'>;
}

export interface HostProfileWithSettings extends HostProfile {
  host_business_settings?: HostBusinessSettings;
}

// Database constraints and relationships reference
export const DATABASE_CONSTRAINTS = {
  // Unique constraints
  unique: [
    'users.email',
    'reviews.booking_id',
    'host_business_settings.host_profile_id',
    'host_availability.(host_profile_id, date, start_time)',
    'host_team_members.(host_profile_id, user_id)',
    'host_analytics.(host_profile_id, date)'
  ],
  
  // Check constraints
  checks: [
    'users.role IN (user, host, admin)',
    'host_profiles.rating >= 0.0 AND rating <= 5.0',
    'host_profiles.years_experience >= 0',
    'experiences.duration_hours > 0',
    'experiences.max_guests > 0',
    'experiences.min_guests > 0',
    'experiences.price_per_person >= 0',
    'bookings.number_of_guests > 0',
    'bookings.total_price >= 0',
    'reviews.rating >= 1 AND rating <= 5'
  ],
  
  // Foreign key relationships
  foreignKeys: [
    'host_profiles.user_id → users.id',
    'experiences.host_id → host_profiles.id',
    'bookings.user_id → users.id',
    'bookings.experience_id → experiences.id',
    'bookings.host_id → host_profiles.id',
    'reviews.booking_id → bookings.id',
    'reviews.user_id → users.id',
    'reviews.experience_id → experiences.id',
    'reviews.host_id → host_profiles.id'
  ]
} as const;
