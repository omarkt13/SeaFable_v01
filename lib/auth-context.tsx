"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getClientSupabase } from "@/lib/client-supabase"
import type { User, Session } from "@supabase/supabase-js"
import type { UserProfile, BusinessProfile } from "@/types/auth"

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  businessProfile: BusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void> // Added refreshAuth to the context type
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
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

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
      const { data, error } = await supabase.from("host_profiles").select("*").eq("user_id", userId).single()

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

  const refreshAuth = useCallback(async () => {
    setIsLoading(true)
    const {
      data: { session: currentSession },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error refreshing session:", error)
      setSession(null)
      setUser(null)
      setUserProfile(null)
      setBusinessProfile(null)
      setUserType(null)
    } else {
      setSession(currentSession)
      setUser(currentSession?.user || null)

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
    }
    setIsLoading(false)
  }, [supabase, fetchUserProfile, fetchBusinessProfile])

  useEffect(() => {
    const {
      data: { subscription: authListenerSubscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // Only trigger a full refresh if the session actually changes or is initially set
      if (currentSession?.user?.id !== user?.id || !session) {
        await refreshAuth()
      }
    })

    // Initial session check on mount
    if (!session && !user) {
      refreshAuth()
    }

    return () => {
      authListenerSubscription.unsubscribe()
    }
  }, [supabase, refreshAuth, session, user]) // Added session and user to dependencies

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
      router.push("/login")
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
    refreshAuth, // Exposed refreshAuth
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
