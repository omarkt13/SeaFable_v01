
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { signOut as authUtilsSignOut } from './auth-utils'

interface AuthContextType {
  user: User | null
  userType: 'customer' | 'business' | null
  hostProfile: any | null
  businessProfile: any | null
  isLoading: boolean
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

      // Determine user type from metadata
      const userTypeFromMetadata = currentUser.user_metadata?.user_type
      console.log('User type from metadata:', userTypeFromMetadata)

      if (userTypeFromMetadata === 'business') {
        setUserType('business')

        // Fetch business profile
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
          console.error('Error fetching host profile:', businessError)
          // If profile doesn't exist, that's okay for business users
          if (businessError.code !== 'PGRST116') {
            console.error('Unexpected error:', businessError)
          }
        } else {
          // Flatten the business settings into the profile object
          const flattenedProfile = {
            ...businessData,
            onboarding_completed: businessData.host_business_settings?.onboarding_completed || false,
            marketplace_enabled: businessData.host_business_settings?.marketplace_enabled || false,
          }
          setBusinessProfile(flattenedProfile)
        }
      } else {
        setUserType('customer')

        // Fetch host profile for customers
        const { data: hostData, error: hostError } = await supabase
          .from('host_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single()

        if (hostError && hostError.code !== 'PGRST116') {
          console.error('Error fetching host profile:', hostError)
        } else if (hostData) {
          setHostProfile(hostData)
        }
      }
    } catch (error) {
      console.error('Error in fetchUserAndProfiles:', error)
    } finally {
      setIsLoading(false)
      console.log('fetchUserAndProfiles finished. User:', currentUser, 'User Type:', userType)
    }
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        console.log('Initial getSession result:', session?.user || null, '(attempt 1)')
        await fetchUserAndProfiles(session?.user || null)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange event:', event, 'Session user:', session?.user || null)
      await fetchUserAndProfiles(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string, type: 'customer' | 'business') => {
    try {
      setIsLoading(true)

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

      // Check user type mismatch
      const userTypeFromMetadata = data.user.user_metadata?.user_type

      if (type === "business" && userTypeFromMetadata === "customer") {
        await authUtilsSignOut()
        return { success: false, error: "Customer accounts should use the customer login page." }
      }

      if (type === "customer" && userTypeFromMetadata === "business") {
        await authUtilsSignOut()
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
      return { 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserType(null)
      setHostProfile(null)
      setBusinessProfile(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    userType,
    hostProfile,
    businessProfile,
    isLoading,
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
