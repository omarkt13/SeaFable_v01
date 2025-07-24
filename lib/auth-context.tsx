"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { signOut as authUtilsSignOut } from "@/lib/auth-utils"

interface HostProfile {
  id: string
  user_id: string
  business_name: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  bio?: string
  profile_image_url?: string
  location?: string
  certifications?: string[]
  years_experience?: number
  specialties?: string[]
  created_at: string
  updated_at: string
}

interface BusinessProfile {
  id: string
  user_id: string
  business_name: string
  business_type: string
  contact_email: string
  contact_phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  description?: string
  website?: string
  social_links?: Record<string, string>
  logo_url?: string
  cover_image_url?: string
  business_hours?: Record<string, any>
  created_at: string
  updated_at: string
}

type UserType = "customer" | "business" | null

interface AuthContextType {
  user: User | null
  userType: UserType
  hostProfile: HostProfile | null
  businessProfile: BusinessProfile | null
  isLoading: boolean
  login: (email: string, password: string, type: "customer" | "business") => Promise<{
    success: boolean
    user?: User
    error?: string
  }>
  logout: () => Promise<void>
  refreshProfiles: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserAndProfiles = async (currentUser: User | null) => {
    console.log("fetchUserAndProfiles called. Current user:", currentUser)

    if (!currentUser) {
      setUser(null)
      setUserType(null)
      setHostProfile(null)
      setBusinessProfile(null)
      setIsLoading(false)
      console.log("fetchUserAndProfiles finished. User:", null, "User Type:", null)
      return
    }

    try {
      setUser(currentUser)

      // Get user type from user metadata
      const userTypeFromMetadata = currentUser.user_metadata?.user_type || currentUser.app_metadata?.user_type
      setUserType(userTypeFromMetadata)

      // Fetch host profile
      const { data: hostData, error: hostError } = await supabase
        .from("host_profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .single()

      if (!hostError && hostData) {
        setHostProfile(hostData)
      }

      // Fetch business profile
      const { data: businessData, error: businessError } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .single()

      if (!businessError && businessData) {
        setBusinessProfile(businessData)
      }

      console.log("fetchUserAndProfiles finished. User:", currentUser, "User Type:", userTypeFromMetadata)
    } catch (error) {
      console.error("Error fetching user profiles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log("Getting initial session...")
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          return
        }
        console.log("Initial getSession result:", session?.user || null, "(attempt 1)")
        await fetchUserAndProfiles(session?.user || null)
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("onAuthStateChange event:", event, "Session user:", session?.user || null)
      await fetchUserAndProfiles(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (
    email: string,
    password: string,
    type: "customer" | "business"
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: "No user data returned" }
      }

      // Check user type matches login type
      const userTypeFromMetadata = data.user.user_metadata?.user_type || data.user.app_metadata?.user_type

      if (type === "customer" && userTypeFromMetadata === "business") {
        await authUtilsSignOut()
        return { success: false, error: "Business accounts should use the business login page." }
      }

      // Proceed with login if all checks pass
      await fetchUserAndProfiles(data.user)

      return { 
        success: true, 
        user: data.user,
        error: undefined 
      }

    } catch (error: any) {
      console.error("Login error:", error)
      return { 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserType(null)
      setHostProfile(null)
      setBusinessProfile(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    userType,
    hostProfile,
    businessProfile,
    isLoading,
    login,
    logout,
    refreshProfiles: () => fetchUserAndProfiles(user),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}