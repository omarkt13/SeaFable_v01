"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
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
    expectedType?: "customer" | "business",
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
        const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) throw error

        if (mountedRef.current) {
          setUserProfile(data)
          setUserType("customer")
        }
        return data
      } catch (error) {
        console.error("Error fetching user profile:", error)
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
          .eq("id", userId)
          .single()

        if (error) throw error

        const profile = {
          ...data,
          onboarding_completed: data.host_business_settings?.onboarding_completed || false,
          marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
        }

        if (mountedRef.current) {
          setBusinessProfile(profile)
          setUserType("business")
        }
        return profile
      } catch (error) {
        console.error("Error fetching business profile:", error)
        return null
      }
    },
    [supabase],
  )

  const determineUserType = useCallback(
    async (userId: string) => {
      // First check if user exists in host_profiles (business)
      const businessProfile = await fetchBusinessProfile(userId)
      if (businessProfile) {
        return "business"
      }

      // Then check if user exists in users table (customer)
      const userProfile = await fetchUserProfile(userId)
      if (userProfile) {
        return "customer"
      }

      return null
    },
    [fetchBusinessProfile, fetchUserProfile],
  )

  const login = useCallback(
    async (email: string, password: string, expectedType?: "customer" | "business") => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        if (data.user) {
          const actualUserType = await determineUserType(data.user.id)

          if (!actualUserType) {
            await supabase.auth.signOut()
            return { success: false, error: "Account not found in system" }
          }

          // Check if the user type matches expectation
          if (expectedType && actualUserType !== expectedType) {
            await supabase.auth.signOut()
            if (expectedType === "business") {
              return {
                success: false,
                error:
                  "This account is not registered as a business. Please use customer login or register your business first.",
              }
            } else {
              return { success: false, error: "This appears to be a business account. Please use business login." }
            }
          }

          // Update user metadata to ensure consistency
          await supabase.auth.updateUser({
            data: { user_type: actualUserType },
          })

          return { success: true }
        }

        return { success: false, error: "Login failed" }
      } catch (error: any) {
        console.error("Login error:", error)
        return { success: false, error: error.message || "Login failed" }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, determineUserType],
  )

  const refreshProfile = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await determineUserType(user.id)
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
  }, [user, determineUserType])

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
            await determineUserType(session.user.id)
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
        await determineUserType(session.user.id)
      }
    })

    return () => {
      mounted = false
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [supabase, determineUserType, clearAuthState])

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
