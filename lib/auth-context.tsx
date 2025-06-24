"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client" // Use the client-side Supabase instance
import { getUserProfile, getBusinessProfile, signOut as authUtilsSignOut } from "@/lib/auth-utils" // Import profile fetching and signOut from auth-utils
import type { UserProfile, BusinessProfile } from "@/types/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  businessProfile: BusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
  login: (email: string, password: string, type: string) => Promise<{ success: boolean; user?: User; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [userType, setUserType] = useState<"customer" | "business" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient() // Use the client-side Supabase instance

  const fetchUserAndProfiles = async (currentUser: User | null) => {
    setIsLoading(true)
    setUser(currentUser)
    setUserProfile(null)
    setBusinessProfile(null)
    setUserType(null)

    if (currentUser) {
      let determinedUserType: "customer" | "business" | null = null
      let fetchedUserProfile: UserProfile | null = null
      let fetchedBusinessProfile: BusinessProfile | null = null

      // Attempt to determine user type from metadata first (if set during signup)
      const userMetadataType = currentUser.user_metadata?.user_type as "customer" | "business" | undefined

      if (userMetadataType === "business") {
        fetchedBusinessProfile = await getBusinessProfile(currentUser.id)
        if (fetchedBusinessProfile) {
          determinedUserType = "business"
        }
      } else if (userMetadataType === "customer") {
        fetchedUserProfile = await getUserProfile(currentUser.id)
        if (fetchedUserProfile) {
          determinedUserType = "customer"
        }
      }

      // Fallback: if user_type not in metadata or profile not found, check both tables
      if (!determinedUserType) {
        fetchedBusinessProfile = await getBusinessProfile(currentUser.id)
        if (fetchedBusinessProfile) {
          determinedUserType = "business"
        } else {
          fetchedUserProfile = await getUserProfile(currentUser.id)
          if (fetchedUserProfile) {
            determinedUserType = "customer"
          }
        }
      }

      setUserProfile(fetchedUserProfile)
      setBusinessProfile(fetchedBusinessProfile)
      setUserType(determinedUserType)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndProfiles(session?.user || null)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      fetchUserAndProfiles(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array ensures this runs once on mount

  const login = async (
    email: string,
    password: string,
    type: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // After successful login, re-fetch profiles and user type
        await fetchUserAndProfiles(data.user)

        // Additional check to ensure user logs into the correct portal
        if (type === "customer" && userType === "business") {
          await authUtilsSignOut() // Use the signOut from auth-utils
          return { success: false, error: "Business accounts should use the business login page." }
        }
        if (type === "business" && userType === "customer") {
          await authUtilsSignOut() // Use the signOut from auth-utils
          return { success: false, error: "Customer accounts should use the customer login page." }
        }

        return { success: true, user: data.user }
      }
      return { success: false, error: "Login failed: No user data." }
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred during login." }
    }
  }

  const signOut = async () => {
    await authUtilsSignOut() // Use the signOut from auth-utils
    setUser(null)
    setUserProfile(null)
    setBusinessProfile(null)
    setUserType(null)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, businessProfile, userType, isLoading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
