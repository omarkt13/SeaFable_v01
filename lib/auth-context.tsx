"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getClientSupabase } from "@/lib/client-supabase"
import type { User, Session } from "@supabase/supabase-js"
import type { UserProfile, BusinessProfile } from "@/types/auth" // Assuming these types exist

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  businessProfile: BusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [userType, setUserType] = useState<"customer" | "business" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = getClientSupabase()

  const fetchUserProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("users") // Use the correct table name from your image
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching user profile:", error)
        setUserProfile(null)
        return null
      }
      setUserProfile(data as UserProfile)
      return data as UserProfile
    },
    [supabase],
  )

  const fetchBusinessProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("host_profiles") // Use the correct table name from your image
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error) {
        console.error("Error fetching business profile:", error)
        setBusinessProfile(null)
        return null
      }
      setBusinessProfile(data as BusinessProfile)
      return data as BusinessProfile
    },
    [supabase],
  )

  useEffect(() => {
    const {
      data: { subscription: authListenerSubscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user || null)
      setIsLoading(true) // Set loading true when auth state changes

      if (currentSession?.user) {
        const fetchedUserProfile = await fetchUserProfile(currentSession.user.id)
        if (fetchedUserProfile?.user_type === "business") {
          await fetchBusinessProfile(currentSession.user.id)
          setUserType("business")
        } else {
          setUserType("customer")
        }
      } else {
        setUserProfile(null)
        setBusinessProfile(null)
        setUserType(null)
      }
      setIsLoading(false) // Set loading false after all data is fetched
    })

    // Initial session check
    const getSession = async () => {
      const {
        data: { session: initialSession },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting initial session:", error)
      }
      setSession(initialSession)
      setUser(initialSession?.user || null)

      if (initialSession?.user) {
        const fetchedUserProfile = await fetchUserProfile(initialSession.user.id)
        if (fetchedUserProfile?.user_type === "business") {
          await fetchBusinessProfile(initialSession.user.id)
          setUserType("business")
        } else {
          setUserType("customer")
        }
      }
      setIsLoading(false)
    }

    getSession()

    return () => {
      authListenerSubscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile, fetchBusinessProfile])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    } else {
      setUser(null)
      setSession(null)
      setUserProfile(null)
      setBusinessProfile(null)
      setUserType(null)
      router.push("/login") // Redirect to login page after sign out
    }
    setIsLoading(false)
  }, [supabase, router])

  const value = {
    user,
    session,
    userProfile,
    businessProfile,
    userType,
    isLoading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
