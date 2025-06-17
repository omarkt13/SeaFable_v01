"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "./supabase"
import { signInUser, signOutUser } from "./database"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "user" | "host" | "admin"
  avatarUrl?: string
  profileComplete: boolean
  hostProfile?: {
    id: string
    name: string
    bio: string
    yearsExperience: number
    certifications: string[]
    specialties: string[]
    rating: number
    totalReviews: number
    hostType: string
  }
  businessProfile?: {
    companyName: string
    businessType: string
    yearsInBusiness: number
    totalExperiences: number
    averageRating: number
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (
    email: string,
    password: string,
    userType?: string,
  ) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => void
  checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await checkAuthStatus()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Get user data from database
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (!error && userData) {
          // Get host profile if user is a host
          let hostProfile = null
          let businessProfile = null

          if (userData.role === "host") {
            const { data: hostData, error: hostError } = await supabase
              .from("host_profiles")
              .select("*")
              .eq("user_id", userData.id)
              .single()

            if (!hostError && hostData) {
              hostProfile = {
                id: hostData.id,
                name: hostData.name,
                bio: hostData.bio || "",
                yearsExperience: hostData.years_experience || 0,
                certifications: hostData.certifications || [],
                specialties: hostData.specialties || [],
                rating: hostData.rating || 0,
                totalReviews: hostData.total_reviews || 0,
                hostType: hostData.host_type || "individual_operator",
              }

              businessProfile = {
                companyName: hostData.business_name || hostData.name,
                businessType: hostData.business_type || "Tour Operator",
                yearsInBusiness: hostData.years_experience || 0,
                totalExperiences: 0, // Will be calculated
                averageRating: hostData.rating || 0,
              }
            }
          }

          const transformedUser: User = {
            id: userData.id,
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.email,
            role: userData.role,
            avatarUrl: userData.avatar_url,
            profileComplete: true,
            hostProfile,
            businessProfile,
          }

          setUser(transformedUser)
          setIsAuthenticated(true)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, userType = "customer") => {
    setIsLoading(true)
    try {
      const response = await signInUser(email, password)

      if (response.success && response.user) {
        const transformedUser: User = {
          id: response.user.id,
          firstName: response.user.first_name,
          lastName: response.user.last_name,
          email: response.user.email,
          role: response.user.role,
          avatarUrl: response.user.avatar_url,
          profileComplete: true,
          hostProfile: response.user.hostProfile
            ? {
                id: response.user.hostProfile.id,
                name: response.user.hostProfile.name,
                bio: response.user.hostProfile.bio || "",
                yearsExperience: response.user.hostProfile.years_experience || 0,
                certifications: response.user.hostProfile.certifications || [],
                specialties: response.user.hostProfile.specialties || [],
                rating: response.user.hostProfile.rating || 0,
                totalReviews: response.user.hostProfile.total_reviews || 0,
                hostType: response.user.hostProfile.host_type || "individual_operator",
              }
            : undefined,
          businessProfile: response.user.businessProfile,
        }

        setUser(transformedUser)
        setIsAuthenticated(true)
        return { success: true, user: transformedUser }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOutUser()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
