"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase" // ONLY import from here
import type { UserProfile, BusinessProfile } from "@/types/auth"

interface ExtendedBusinessProfile extends BusinessProfile {
  onboarding_completed?: boolean
  marketplace_enabled?: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  businessProfile: ExtendedBusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
  error: string | null
  login: (
    email: string,
    password: string,
    expectedUserType?: "customer" | "business",
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [businessProfile, setBusinessProfile] = useState<ExtendedBusinessProfile | null>(null)
  const [userType, setUserType] = useState<"customer" | "business" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mountedRef = useRef(true)

  const clearAuthState = useCallback(() => {
    if (!mountedRef.current) return
    console.log("AuthContext: Clearing auth state.")
    setUser(null)
    setSession(null)
    setUserProfile(null)
    setBusinessProfile(null)
    setUserType(null)
    setError(null)
  }, [])

  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log(`AuthContext: Attempting to fetch customer profile for user ID: ${userId}`)
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("AuthContext: Error fetching user profile:", error)
        return null
      }

      if (mountedRef.current && data) {
        console.log("AuthContext: Customer profile fetched successfully:", data)
        setUserProfile(data)
        setUserType("customer")
      } else {
        console.log("AuthContext: No customer profile found or component unmounted.")
      }
      return data
    } catch (error) {
      console.error("AuthContext: Network error fetching user profile:", error)
      return null
    }
  }, [])

  const fetchBusinessProfile = useCallback(async (userId: string) => {
    console.log(`AuthContext: Attempting to fetch business profile for user ID: ${userId}`)
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
        .maybeSingle()

      if (error) {
        console.error("AuthContext: Error fetching business profile:", error)
        return null
      }

      if (mountedRef.current && data) {
        console.log("AuthContext: Business profile fetched successfully:", data)
        const profile: ExtendedBusinessProfile = {
          ...data,
          onboarding_completed: data.host_business_settings?.onboarding_completed || false,
          marketplace_enabled: data.host_business_settings?.marketplace_enabled || false,
        }
        setBusinessProfile(profile)
        setUserType("business")
        return profile
      } else {
        console.log("AuthContext: No business profile found or component unmounted.")
      }
      return null
    } catch (error) {
      console.error("AuthContext: Network error fetching business profile:", error)
      return null
    }
  }, [])

  const determineUserType = useCallback(
    async (userId: string) => {
      console.log(`AuthContext: Determining user type for user ID: ${userId}`)
      // Try business profile first
      const businessProfile = await fetchBusinessProfile(userId)
      if (businessProfile) {
        console.log("AuthContext: User identified as 'business'.")
        return "business"
      }

      // Fallback to customer profile
      const userProfile = await fetchUserProfile(userId)
      if (userProfile) {
        console.log("AuthContext: User identified as 'customer'.")
        return "customer"
      }

      console.log("AuthContext: User type could not be determined.")
      return null
    },
    [fetchBusinessProfile, fetchUserProfile],
  )

  const login = useCallback(
    async (email: string, password: string, expectedUserType?: "customer" | "business") => {
      console.log(`AuthContext: Attempting login for email: ${email}, expected type: ${expectedUserType || "any"}`)
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error("AuthContext: Supabase signInWithPassword error:", signInError)
          throw signInError
        }

        if (!data.user) {
          console.error("AuthContext: No user data returned after signInWithPassword.")
          throw new Error("No user data returned")
        }

        console.log("AuthContext: User signed in with Supabase. User ID:", data.user.id)

        // Determine actual user type
        const actualUserType = await determineUserType(data.user.id)
        console.log("AuthContext: Actual user type determined as:", actualUserType)

        if (!actualUserType) {
          console.log("AuthContext: Account not found in system, signing out.")
          await supabase.auth.signOut()
          throw new Error("Account not found in system")
        }

        // Validate expected user type
        if (expectedUserType && expectedUserType !== actualUserType) {
          console.log(
            `AuthContext: User type mismatch. Expected: ${expectedUserType}, Actual: ${actualUserType}. Signing out.`,
          )
          await supabase.auth.signOut()

          if (expectedUserType === "business") {
            throw new Error("This account is not registered as a business. Please use customer login.")
          } else {
            throw new Error("This account is registered as a business. Please use business login.")
          }
        }

        console.log("AuthContext: Login successful.")
        return { success: true }
      } catch (error: any) {
        console.error("AuthContext: Login process failed:", error)
        return { success: false, error: error.message || "Login failed" }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [determineUserType],
  )

  const refreshProfile = useCallback(async () => {
    if (!user) {
      console.log("AuthContext: No user to refresh profile for.")
      return
    }

    setIsLoading(true)
    setError(null)
    console.log(`AuthContext: Refreshing profile for user ID: ${user.id}`)

    try {
      await determineUserType(user.id)
      console.log("AuthContext: Profile refreshed successfully.")
    } catch (error) {
      console.error("AuthContext: Error refreshing profile:", error)
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
    console.log("AuthContext: Attempting to sign out.")
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      clearAuthState()
      console.log("AuthContext: Signed out successfully.")
    } catch (error) {
      console.error("AuthContext: Error signing out:", error)
      if (mountedRef.current) {
        setError("Failed to sign out")
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [clearAuthState])

  useEffect(() => {
    let mounted = true
    mountedRef.current = true
    console.log("AuthContext: useEffect - Initializing auth.")

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
          console.log("AuthContext: Initial session and user set. User:", session?.user?.id)

          if (session?.user) {
            await determineUserType(session.user.id)
          } else {
            setIsLoading(false)
            console.log("AuthContext: No initial user session, setting isLoading to false.")
          }
        }
      } catch (error) {
        console.error("AuthContext: Error initializing auth:", error)
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
      console.log(`AuthContext: Auth state changed. Event: ${event}, User: ${session?.user?.id}`)

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
      console.log("AuthContext: useEffect cleanup - Unsubscribed from auth state changes.")
    }
  }, [determineUserType, clearAuthState])

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
