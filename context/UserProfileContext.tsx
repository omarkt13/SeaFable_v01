"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context" // Use the Supabase-based useAuth

interface UserProfile {
  id: string // This is the primary key of the user_profiles table
  user_id: string // This is the foreign key to auth.users.id
  first_name: string | null
  last_name: string | null
  email: string
  user_type: "customer" | "business" | "admin" | null
  onboarding_completed: boolean
  avatar_url: string | null
  // Add other profile fields as needed
}

interface UserProfileContextType {
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null
  fetchUserProfile: (userId: string) => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, isLoading: authLoading } = useAuth() // Get user from the main AuthContext
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

      if (dbError) {
        // If no rows found (PGRST116), it means profile doesn't exist yet, which is fine.
        // For other errors, re-throw.
        if (dbError.code !== "PGRST116") {
          throw dbError
        }
        setUserProfile(null) // No profile found
      } else {
        setUserProfile(data as UserProfile)
      }
    } catch (err) {
      console.error("Error fetching user profile:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch user profile")
      setUserProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!authUser?.id) {
        return { success: false, error: "User not authenticated." }
      }

      setIsLoading(true)
      setError(null)
      try {
        const { data, error: dbError } = await supabase
          .from("user_profiles")
          .update(updates)
          .eq("user_id", authUser.id)
          .select()
          .single()

        if (dbError) {
          throw dbError
        }

        if (data) {
          setUserProfile(data as UserProfile)
          return { success: true }
        }
        return { success: false, error: "No data returned after update." }
      } catch (err) {
        console.error("Error updating user profile:", err)
        setError(err instanceof Error ? err.message : "Failed to update user profile")
        return { success: false, error: err instanceof Error ? err.message : "Failed to update user profile" }
      } finally {
        setIsLoading(false)
      }
    },
    [authUser],
  )

  useEffect(() => {
    if (!authLoading && authUser?.id) {
      fetchUserProfile(authUser.id)
    } else if (!authLoading && !authUser) {
      setUserProfile(null)
      setIsLoading(false)
    }
  }, [authUser, authLoading, fetchUserProfile])

  const value = {
    userProfile,
    isLoading,
    error,
    fetchUserProfile,
    updateUserProfile,
  }

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider")
  }
  return context
}
