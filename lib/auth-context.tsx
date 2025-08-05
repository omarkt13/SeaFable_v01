"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { User } from '@supabase/supabase-js'
import { createClient } from './supabase/client'

const supabase = createClient()
import { signOut as authUtilsSignOut } from './auth-utils'

interface AuthContextType {
  user: User | null
  userType: 'customer' | 'business' | null
  hostProfile: any | null
  businessProfile: any | null
  isLoading: boolean
  loading: boolean
  login: (email: string, password: string, type: 'customer' | 'business') => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => Promise<void>
  refreshProfiles: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<'customer' | 'business' | null>(null)
  const [hostProfile, setHostProfile] = useState<any | null>(null)
  const [businessProfile, setBusinessProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserAndProfiles = async (currentUser: User | null) => {
    console.log('fetchUserAndProfiles called. Current user:', currentUser)

    if (!currentUser) {
      setUser(null)
      setUserType(null)
      setHostProfile(null)
      setBusinessProfile(null)
      setIsLoading(false)
      console.log('fetchUserAndProfiles finished. User:', null, 'User Type:', null)
      return
    }

    try {
      setUser(currentUser)

      // Determine user type from metadata - this is immutable once set
      const userTypeFromMetadata = currentUser.user_metadata?.user_type
      console.log('User type from metadata:', userTypeFromMetadata)

      // Validate user type exists and is valid
      if (!userTypeFromMetadata || !['customer', 'business'].includes(userTypeFromMetadata)) {
        console.error('Invalid or missing user type in metadata')
        await supabase.auth.signOut()
        return
      }

      if (userTypeFromMetadata === 'business') {
        setUserType('business')

        // Fetch business profile with proper error handling
        try {
          const { data: businessData, error: businessError } = await supabase
            .from('host_profiles')
            .select(`
              *,
              host_business_settings (
                onboarding_completed,
                marketplace_enabled
              )
            `)
            .eq('user_id', currentUser.id)
            .single()

          if (businessError) {
            if (businessError.code === 'PGRST116') {
              // Profile doesn't exist - this is expected for new users
              console.log('No business profile found for user:', currentUser.id, '- this is normal for new users')
              setBusinessProfile(null)
            } else {
              // Actual error occurred
              console.error('Business profile fetch error:', businessError)
              setBusinessProfile(null)
            }
          } else if (businessData) {
            // Flatten the business settings into the profile object
            const flattenedProfile = {
              ...businessData,
              onboarding_completed: businessData.host_business_settings?.onboarding_completed || false,
              marketplace_enabled: businessData.host_business_settings?.marketplace_enabled || false,
            }
            console.log('Business profile loaded successfully:', flattenedProfile.id)
            setBusinessProfile(flattenedProfile);
          }
        } catch (profileError) {
          console.error('Exception during business profile fetch:', profileError)
          setBusinessProfile(null)
        }
      } else {
        setUserType('customer');

        // Fetch host profile for customers (optional)
        const { data: hostData, error: hostError } = await supabase
          .from('host_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single()

        if (hostError && hostError.code !== 'PGRST116') {
          console.error('Error fetching customer host profile:', hostError)
        } else if (hostData) {
          setHostProfile(hostData)
        }
      }
    } catch (error) {
      console.error('Error in fetchUserAndProfiles:', error)
      // On error, clear auth state for security
      setUser(null)
      setUserType(null)
      setHostProfile(null)
      setBusinessProfile(null)
    } finally {
      setIsLoading(false)
      console.log('fetchUserAndProfiles finished. User:', currentUser?.id, 'User Type:', currentUser?.user_metadata?.user_type || null)
    }
  }

  useIsomorphicLayoutEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const initializeAuth = async () => {
      console.log("Getting initial session...")

      let sessionResult = null
      let attempts = 0
      const maxAttempts = 3

      // Retry session retrieval with exponential backoff
      while (!sessionResult && attempts < maxAttempts) {
        attempts++
        try {
          const sessionResponse = await supabase.auth.getSession()
          if (sessionResponse.error) {
            console.error(`Session error (attempt ${attempts}):`, sessionResponse.error)
            if (sessionResponse.error.message?.includes('Invalid JWT') || sessionResponse.error.message?.includes('expired')) {
              // Clear invalid session
              await supabase.auth.signOut()
              break
            }
          } else {
            sessionResult = sessionResponse.data?.session || null
          }
        } catch (err) {
          console.error(`Session retrieval error (attempt ${attempts}):`, err)
          // If it's a syntax error, skip retries
          if (err instanceof SyntaxError) {
            console.error('Syntax error in session retrieval, stopping retries')
            break
          }
        }

        if (!sessionResult && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempts)) // exponential backoff
        }
      }

      console.log(`Initial getSession result:`, sessionResult, `(attempt ${attempts})`)

      if (sessionResult?.user) {
        await fetchUserAndProfiles(sessionResult.user)
      } else {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange event:', event, 'Session user:', session?.user || null)

      // Prevent race conditions by checking if already processing
      if (isLoading && event === 'SIGNED_IN') {
        return
      }

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserAndProfiles(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserType(null)
        setHostProfile(null)
        setBusinessProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string, type: 'customer' | 'business') => {
    try {
      setIsLoading(true)

      // Clear any existing session first
      await authUtilsSignOut()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: "No user data returned" }
      }

      // Let Supabase handle session establishment naturally through auth state changes

      // Check user type mismatch - this is immutable security check
      const userTypeFromMetadata = data.user.user_metadata?.user_type

      if (!userTypeFromMetadata) {
        await supabase.auth.signOut()
        return { success: false, error: "Account type not found. Please contact support." }
      }

      if (type === "business" && userTypeFromMetadata === "customer") {
        await supabase.auth.signOut()
        return { success: false, error: "Customer accounts should use the customer login page." }
      }

      if (type === "customer" && userTypeFromMetadata === "business") {
        await supabase.auth.signOut()
        return { success: false, error: "Business accounts should use the business login page." }
      }

      // Proceed with login if all checks pass
      await fetchUserAndProfiles(data.user)

      return { 
        success: true, 
        user: data.user,
        error: undefined 
      }

    } catch (error: any) {
      console.error("Login error:", error)
      await supabase.auth.signOut() // Clean up on error
      return { 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserType(null)
      setHostProfile(null)
      setBusinessProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [])

  const value = {
    user,
    userType,
    hostProfile,
    businessProfile,
    isLoading,
    loading: isLoading,
    login,
    logout,
    refreshProfiles: () => fetchUserAndProfiles(user),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}