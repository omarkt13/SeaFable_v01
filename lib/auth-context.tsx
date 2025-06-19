"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabase" // Correctly import supabase client

// Define a more comprehensive User type based on Supabase auth and user_profiles table
interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url?: string | null
  role: "customer" | "business" | "admin" | null // Role from user_profiles table
  onboarding_completed: boolean // From user_profiles table
  businessProfile?: {
    id: string
    name: string
    onboarding_completed: boolean
    // Add other relevant business profile fields
  } | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>
  signup: (
    email: string,
    password: string,
    userType: "customer" | "business",
  ) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<void>
  userType: "customer" | "business" | "admin" | null // Derived from user.role
  businessProfile: User["businessProfile"] // Directly expose businessProfile
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Prevent multiple simultaneous auth checks
  const authCheckInProgress = useRef(false)
  const retryCount = useRef(0)
  const maxRetries = 3

  const fetchAndSetUserProfile = useCallback(
    async (userId: string) => {
      try {
        // Fetch user profile from 'user_profiles' table
        let { data: userProfileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (profileError) {
          // If no rows found (PGRST116), it means profile doesn't exist yet, which is fine.
          // For other errors, re-throw.
          if (profileError.code !== "PGRST116") {
            throw profileError
          }
          // If profile not found, create a basic one
          const { data: newProfile, error: insertError } = await supabase
            .from("user_profiles")
            .insert({ user_id: userId, email: user?.email || "", user_type: "customer", onboarding_completed: false })
            .select("*")
            .single()

          if (insertError) {
            throw insertError
          }
          userProfileData = newProfile
        }

        let businessProfileData = null
        if (userProfileData?.user_type === "business") {
          const { data: hostProfile, error: hostError } = await supabase
            .from("host_profiles")
            .select("id, name, onboarding_completed") // Select relevant fields
            .eq("user_id", userId)
            .single()

          if (hostError && hostError.code !== "PGRST116") {
            // PGRST116 means no rows found, which is fine if profile isn't complete
            console.warn("Could not fetch host profile:", hostError.message)
          }
          businessProfileData = hostProfile
        }

        const transformedUser: User = {
          id: userId,
          email: userProfileData?.email || "", // Fallback, though email should always be there
          first_name: userProfileData?.first_name || null,
          last_name: userProfileData?.last_name || null,
          avatar_url: userProfileData?.avatar_url || null,
          role: userProfileData?.user_type || null,
          onboarding_completed: userProfileData?.onboarding_completed || false,
          businessProfile: businessProfileData,
        }

        setUser(transformedUser)
        setIsAuthenticated(true)
        retryCount.current = 0 // Reset retry count on success
      } catch (error) {
        console.error("Error fetching user profile:", error)
        throw error // Re-throw to be caught by checkAuthStatus
      }
    },
    [user?.email],
  ) // Depend on user.email for new profile creation fallback

  const checkAuthStatus = useCallback(async () => {
    if (authCheckInProgress.current) return
    authCheckInProgress.current = true
    setIsLoading(true)
    setAuthError(null)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error(`Supabase session error: ${sessionError.message}`)
      }

      if (session?.user) {
        // Check if token is expired
        const tokenExp = session.expires_at
        if (tokenExp && tokenExp * 1000 < Date.now()) {
          throw new Error("Supabase token expired")
        }
        await fetchAndSetUserProfile(session.user.id)
      } else {
        // No session - user is not authenticated
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      retryCount.current++
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"

      if (retryCount.current <= maxRetries && !errorMessage.includes("Supabase token expired")) {
        setTimeout(() => {
          authCheckInProgress.current = false
          checkAuthStatus()
        }, Math.pow(2, retryCount.current) * 1000)
        return
      }

      setUser(null)
      setIsAuthenticated(false)
      setAuthError(errorMessage)

      if (errorMessage.includes("Supabase token expired")) {
        await supabase.auth.signOut()
      }
    } finally {
      setIsLoading(false)
      authCheckInProgress.current = false
    }
  }, [fetchAndSetUserProfile])

  useEffect(() => {
    checkAuthStatus()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)
      switch (event) {
        case "SIGNED_IN":
          if (session) {
            retryCount.current = 0
            await fetchAndSetUserProfile(session.user.id)
          }
          break
        case "SIGNED_OUT":
          setUser(null)
          setIsAuthenticated(false)
          setAuthError(null)
          setIsLoading(false)
          break
        case "TOKEN_REFRESHED":
          if (session && user) {
            await fetchAndSetUserProfile(session.user.id)
          }
          break
        default:
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkAuthStatus, fetchAndSetUserProfile, user])

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setAuthError(null)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          throw error
        }

        if (data.user) {
          await fetchAndSetUserProfile(data.user.id)
          return { success: true, user: user } // user state will be updated by fetchAndSetUserProfile
        } else {
          return { success: false, error: "Login failed: No user data returned." }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed"
        setAuthError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [fetchAndSetUserProfile, user],
  )

  const signup = useCallback(
    async (email: string, password: string, userType: "customer" | "business") => {
      setIsLoading(true)
      setAuthError(null)
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType, // Pass user_type to Supabase auth metadata
            },
          },
        })

        if (error) {
          throw error
        }

        if (data.user) {
          // Insert into user_profiles table
          const { error: profileInsertError } = await supabase.from("user_profiles").insert({
            user_id: data.user.id,
            email: data.user.email,
            user_type: userType,
            onboarding_completed: false, // Default to false on signup
          })

          if (profileInsertError) {
            // If profile insert fails, consider rolling back or logging
            console.error("Error inserting user profile:", profileInsertError)
            await supabase.auth.signOut() // Attempt to sign out the partially created user
            throw new Error("Failed to create user profile. Please try again.")
          }

          if (userType === "business") {
            const { error: hostProfileInsertError } = await supabase.from("host_profiles").insert({
              user_id: data.user.id,
              name: "New Business", // Default name, can be updated later
              onboarding_completed: false,
            })
            if (hostProfileInsertError) {
              console.error("Error inserting host profile:", hostProfileInsertError)
              // Decide how to handle this: rollback, log, or allow partial creation
            }
          }

          await fetchAndSetUserProfile(data.user.id)
          return { success: true, user: user }
        } else {
          return { success: false, error: "Signup failed: No user data returned." }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Signup failed"
        setAuthError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [fetchAndSetUserProfile, user],
  )

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      // State will be cleared by onAuthStateChange listener
    } catch (error) {
      console.error("Logout error:", error)
      setAuthError(error instanceof Error ? error.message : "Logout failed")
      // Force clear local state if API call fails
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const userType = user?.role || null
  const businessProfile = user?.businessProfile || null

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      authError,
      login,
      signup,
      logout,
      checkAuthStatus,
      userType,
      businessProfile,
    }),
    [user, isAuthenticated, isLoading, authError, login, signup, logout, checkAuthStatus, userType, businessProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
