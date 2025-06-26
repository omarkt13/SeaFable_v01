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
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  login: (
    email: string,
    password: string,
    expectedUserType?: "customer" | "business",
  ) => Promise<{
    success: boolean
    error?: string
    userType?: "customer" | "business"
  }>
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
        if (mountedRef.current) {
          setError("Failed to fetch business profile")
        }
        return null
      }
    },
    [supabase],
  )

  const refreshProfile = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Try business profile first
      const businessProfile = await fetchBusinessProfile(user.id)
      if (businessProfile) return

      // Fallback to user profile
      await fetchUserProfile(user.id)
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

  // NEW: Login function that handles both customer and business authentication
  const login = useCallback(
    async (email: string, password: string, expectedUserType?: "customer" | "business") => {
      try {
        setError(null)

        // Sign in with Supabase
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        if (!data.user) {
          throw new Error("Authentication failed")
        }

        // Check user type by querying database tables
        const [businessCheck, userCheck] = await Promise.all([
          supabase.from("host_profiles").select("id").eq("id", data.user.id).single(),
          supabase.from("users").select("id").eq("id", data.user.id).single(),
        ])

        const isBusiness = !businessCheck.error && businessCheck.data
        const isUser = !userCheck.error && userCheck.data

        let actualUserType: "customer" | "business"

        if (isBusiness) {
          actualUserType = "business"
        } else if (isUser) {
          actualUserType = "customer"
        } else {
          // Sign out if user is not in either table
          await supabase.auth.signOut()
          throw new Error("Account not found in system")
        }

        // If expectedUserType is specified, validate it matches
        if (expectedUserType && expectedUserType !== actualUserType) {
          await supabase.auth.signOut()

          if (expectedUserType === "business") {
            throw new Error("This account is not registered as a business. Please use customer login.")
          } else {
            throw new Error("This account is registered as a business. Please use business login.")
          }
        }

        return {
          success: true,
          userType: actualUserType,
        }
      } catch (error: any) {
        console.error("Login error:", error)
        return {
          success: false,
          error: error.message || "Login failed",
        }
      }
    },
    [supabase],
  )

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
    signOut,
    refreshProfile,
    login, // Now exported
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
