export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          avatar_url: string | null
          role: "user" | "host" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          avatar_url?: string | null
          role?: "user" | "host" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          avatar_url?: string | null
          role?: "user" | "host" | "admin"
          updated_at?: string
        }
      }
      host_profiles: {
        Row: {
          id: string
          user_id: string | null
          name: string
          bio: string | null
          avatar_url: string | null
          years_experience: number | null
          certifications: string[]
          specialties: string[]
          rating: number
          total_reviews: number
          host_type: "captain" | "instructor" | "guide" | "company" | "individual_operator"
          languages_spoken: string[]
          business_name: string | null
          contact_name: string | null
          email: string | null
          phone: string | null
          business_type: string | null
          location: string | null
          description: string | null
          business_registration_id: string | null
          insurance_details: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          bio?: string | null
          avatar_url?: string | null
          years_experience?: number | null
          certifications?: string[]
          specialties?: string[]
          rating?: number
          total_reviews?: number
          host_type: "captain" | "instructor" | "guide" | "company" | "individual_operator"
          languages_spoken?: string[]
          business_name?: string | null
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          business_type?: string | null
          location?: string | null
          description?: string | null
          business_registration_id?: string | null
          insurance_details?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          bio?: string | null
          avatar_url?: string | null
          years_experience?: number | null
          certifications?: string[]
          specialties?: string[]
          rating?: number
          total_reviews?: number
          host_type?: "captain" | "instructor" | "guide" | "company" | "individual_operator"
          languages_spoken?: string[]
          business_name?: string | null
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          business_type?: string | null
          location?: string | null
          description?: string | null
          business_registration_id?: string | null
          insurance_details?: string | null
          updated_at?: string
        }
      }
      experiences: {
        Row: {
          id: string
          host_id: string
          title: string
          description: string | null
          short_description: string | null
          location: string | null
          specific_location: string | null
          country: string | null
          activity_type: string
          category: string[]
          duration_hours: number
          duration_display: string | null
          max_guests: number
          min_guests: number
          price_per_person: number
          difficulty_level: "easy" | "moderate" | "challenging" | "expert"
          rating: number
          total_reviews: number
          total_bookings: number
          primary_image_url: string | null
          weather_contingency: string | null
          included_amenities: string[]
          what_to_bring: string[]
          min_age: number | null
          max_age: number | null
          age_restriction_details: string | null
          activity_specific_details: any
          tags: string[]
          seasonal_availability: string[]
          is_active: boolean
          itinerary: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          description?: string | null
          short_description?: string | null
          location?: string | null
          specific_location?: string | null
          country?: string | null
          activity_type: string
          category: string[]
          duration_hours: number
          duration_display?: string | null
          max_guests: number
          min_guests: number
          price_per_person: number
          difficulty_level: "easy" | "moderate" | "challenging" | "expert"
          rating?: number
          total_reviews?: number
          total_bookings?: number
          primary_image_url?: string | null
          weather_contingency?: string | null
          included_amenities?: string[]
          what_to_bring?: string[]
          min_age?: number | null
          max_age?: number | null
          age_restriction_details?: string | null
          activity_specific_details?: any
          tags?: string[]
          seasonal_availability?: string[]
          is_active?: boolean
          itinerary?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          title?: string
          description?: string | null
          short_description?: string | null
          location?: string | null
          specific_location?: string | null
          country?: string | null
          activity_type?: string
          category?: string[]
          duration_hours?: number
          duration_display?: string | null
          max_guests?: number
          min_guests?: number
          price_per_person?: number
          difficulty_level?: "easy" | "moderate" | "challenging" | "expert"
          rating?: number
          total_reviews?: number
          total_bookings?: number
          primary_image_url?: string | null
          weather_contingency?: string | null
          included_amenities?: string[]
          what_to_bring?: string[]
          min_age?: number | null
          max_age?: number | null
          age_restriction_details?: string | null
          activity_specific_details?: any
          tags?: string[]
          seasonal_availability?: string[]
          is_active?: boolean
          itinerary?: any
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "easy" | "moderate" | "challenging" | "expert"
      booking_status: "pending" | "confirmed" | "cancelled_user" | "cancelled_host" | "completed" | "rescheduled"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
    }
  }
}
