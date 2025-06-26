"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client" // Updated import path
import type { UserProfile, BusinessProfile } from "@/types/auth"

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  businessProfile: BusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
  error: string | null
  login: (
    email: string,
    password: string,
    userType: "customer" | "business",
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [userType, setUserType] = useState<"customer" | "business" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use ref to prevent memory leaks
  const mountedRef = useRef(true)
  const supabase = createClient()

  const clearAuthState = useCallback(() => {
    if (!mountedRef.current) return
    setUser(null)
    setSession(null)
    setUserProfile(null)
    setBusinessProfile(null)
    setUserType(null)
    setError(null)
  }, [])

  const fetchUserProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle() // Use maybeSingle
        if (error) throw error

        if (mountedRef.current) {
          setUserProfile(data as UserProfile)
          if (data) setUserType("customer")
        }
        return data as UserProfile
      } catch (error) {
        console.error("Error fetching user profile:", error)
        if (mountedRef.current) {
          setError("Failed to fetch user profile")
        }
        return null
      }
    },
    [supabase],
  )

  const fetchBusinessProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("host_profiles")
          .select(`
          *,
          host_business_settings (
            onboarding_completed,
            marketplace_enabled
          )
        `)
          .eq("user_id", userId) // Ensure it's user_id
          .maybeSingle() // Use maybeSingle

        if (error) throw error

        const profile = data
          ? {
              ...data,
              onboarding_completed: data.host_business_settings?.onboarding_completed || false,
              marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
            }
          : null

        if (mountedRef.current) {
          setBusinessProfile(profile as BusinessProfile)
          if (profile) setUserType("business")
        }
        return profile as BusinessProfile
      } catch (error) {
        console.error("Error fetching business profile:", error)
        if (mountedRef.current) {
          setError("Failed to fetch business profile")
        }
        return null
      }
    },
    [supabase],
  )

  const login = useCallback(
    async (email: string, password: string, expectedUserType: "customer" | "business") => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        if (!data.user) {
          throw new Error("No user returned from authentication")
        }

        // Verify user type matches expected type
        let isBusiness = false
        const businessProfile = await fetchBusinessProfile(data.user.id)
        if (businessProfile) {
          isBusiness = true
        }

        if (expectedUserType === "business" && !isBusiness) {
          await supabase.auth.signOut()
          throw new Error(
            "This account is not registered as a business. Please use customer login or register your business first.",
          )
        } else if (expectedUserType === "customer" && isBusiness) {
          await supabase.auth.signOut()
          throw new Error("This is a business account. Please use the business login.")
        }

        // Update user metadata to include user type (optional, but good for consistency)
        const { error: updateError } = await supabase.auth.updateUser({
          data: { user_type: expectedUserType },
        })

        if (updateError) {
          console.warn("Failed to update user metadata:", updateError)
        }

        // Refresh profiles after successful login and type verification
        await refreshProfile()

        return { success: true }
      } catch (error: any) {
        console.error("Login error:", error.message)
        setError(error.message)
        return { success: false, error: error.message }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, fetchUserProfile, fetchBusinessProfile],
  )

  const refreshProfile = useCallback(async () => {
    if (!user) {
      if (mountedRef.current) setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Try business profile first
      const businessProfile = await fetchBusinessProfile(user.id)
      if (businessProfile) {
        if (mountedRef.current) setUserType("business")
        return
      }

      // Fallback to user profile
      const userProfile = await fetchUserProfile(user.id)
      if (userProfile) {
        if (mountedRef.current) setUserType("customer")
      } else {
        // If neither profile found, clear user type
        if (mountedRef.current) setUserType(null)
      }
    } catch (error) {
      console.error("Error refreshing profile:", error)
      if (mountedRef.current) {
        setError("Failed to refresh profile")
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [user, fetchBusinessProfile, fetchUserProfile])

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      clearAuthState()
    } catch (error) {
      console.error("Error signing out:", error)
      if (mountedRef.current) {
        setError("Failed to sign out")
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [supabase, clearAuthState])

  useEffect(() => {
    let mounted = true
    mountedRef.current = true

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) throw error

        if (mounted) {
          setSession(session)
          setUser(session?.user || null)

          if (session?.user) {
            await refreshProfile()
          } else {
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (mounted) {
          setError("Failed to initialize authentication")
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setSession(session)
      setUser(session?.user || null)

      if (event === "SIGNED_OUT" || !session?.user) {
        clearAuthState()
        setIsLoading(false)
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refreshProfile()
      }
    })

    return () => {
      mounted = false
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [supabase, refreshProfile, clearAuthState])

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    businessProfile,
    userType,
    isLoading,
    error,
    login,
    signOut,
    refreshProfile,
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
