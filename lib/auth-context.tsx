"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabaseClient } from "@/lib/supabase-client"
import { getUserProfile, getBusinessProfile, signOut } from "@/lib/auth-client"
import type { UserProfile, BusinessProfile } from "@/types/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  businessProfile: BusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
  signOut: typeof signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [userType, setUserType] = useState<"customer" | "business" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      } else {
        // Fallback: check both profiles
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
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndProfiles(session?.user || null)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      fetchUserAndProfiles(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, businessProfile, userType, isLoading, signOut }}>
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
