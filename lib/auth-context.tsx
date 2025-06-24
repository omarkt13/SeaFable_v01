"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/auth-helpers-nextjs"
import { supabase, getUserProfile, getBusinessProfile } from "@/lib/auth-utils"
import type { UserProfile, BusinessProfile } from "@/types/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  businessProfile: BusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
}

// Define AuthContext internally, without an explicit export here.
// It will be accessed by useAuth within the same module.
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Export AuthProvider as a function declaration, which is generally more stable for HMR.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [userType, setUserType] = useState<"customer" | "business" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserAndProfiles = async (currentUser: User | null) => {
    console.log("AuthContext: fetchUserAndProfiles started. Current user:", currentUser?.id)
    setIsLoading(true) // Ensure loading is true at the start of fetching

    setUser(currentUser)
    setUserProfile(null) // Reset profiles
    setBusinessProfile(null)
    setUserType(null)

    if (currentUser) {
      let determinedUserType: "customer" | "business" | null = null
      let fetchedUserProfile: UserProfile | null = null
      let fetchedBusinessProfile: BusinessProfile | null = null

      const userMetadataType = currentUser.user_metadata?.user_type as "customer" | "business" | undefined

      if (userMetadataType === "business") {
        console.log("AuthContext: User metadata indicates 'business'. Fetching business profile.")
        fetchedBusinessProfile = await getBusinessProfile(currentUser.id)
        if (fetchedBusinessProfile) {
          determinedUserType = "business"
        } else {
          console.warn("AuthContext: User metadata 'business' but no business profile found.")
        }
      } else if (userMetadataType === "customer") {
        console.log("AuthContext: User metadata indicates 'customer'. Fetching customer profile.")
        fetchedUserProfile = await getUserProfile(currentUser.id)
        if (fetchedUserProfile) {
          determinedUserType = "customer"
        } else {
          console.warn("AuthContext: User metadata 'customer' but no customer profile found.")
        }
      } else {
        // Fallback for users without user_type in metadata (e.g., older users or if not set during signup)
        console.log("AuthContext: User metadata user_type not set. Attempting to determine via profiles.")
        fetchedBusinessProfile = await getBusinessProfile(currentUser.id)
        if (fetchedBusinessProfile) {
          determinedUserType = "business"
        } else {
          fetchedUserProfile = await getUserProfile(currentUser.id)
          if (fetchedUserProfile) {
            determinedUserType = "customer" // Default to customer if no business profile found
          }
        }
      }

      setUserProfile(fetchedUserProfile)
      setBusinessProfile(fetchedBusinessProfile)
      setUserType(determinedUserType)
      console.log("AuthContext: Profiles fetched. UserType:", determinedUserType, "User:", currentUser?.id)
    } else {
      console.log("AuthContext: No current user. Setting states to null.")
    }
    setIsLoading(false) // Set loading to false ONLY after all async operations are complete
    console.log("AuthContext: fetchUserAndProfiles completed. isLoading set to false.")
  }

  useEffect(() => {
    console.log("AuthContext: useEffect mounted. Initial session check.")
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndProfiles(session?.user || null)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthContext: onAuthStateChange event:", event, "Session user:", session?.user?.id)
      fetchUserAndProfiles(session?.user || null)
    })

    return () => {
      console.log("AuthContext: useEffect cleanup. Unsubscribing from auth state changes.")
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array ensures this runs once on mount

  return (
    <AuthContext.Provider value={{ user, userProfile, businessProfile, userType, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Export useAuth as a function declaration
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
