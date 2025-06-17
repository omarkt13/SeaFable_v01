"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

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

// Mock API function
const mockLoginAPI = async (email: string, password: string, userType: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const mockUsers: Record<string, User> = {
    "customer@seafable.com": {
      id: "user_1",
      firstName: "Emma",
      lastName: "Wilson",
      email: "customer@seafable.com",
      role: "user",
      avatarUrl: "/placeholder.svg?height=150&width=150",
      profileComplete: true,
    },
    "host@seafable.com": {
      id: "host_1",
      firstName: "Captain",
      lastName: "Rodriguez",
      email: "host@seafable.com",
      role: "host",
      avatarUrl: "/placeholder.svg?height=150&width=150",
      profileComplete: true,
      hostProfile: {
        id: "host_prof_1",
        name: "Captain Rodriguez",
        bio: "Experienced sailing instructor with 15+ years on the water",
        yearsExperience: 15,
        certifications: ["USCG Master License", "ASA Instructor"],
        specialties: ["Sailing", "Navigation", "Safety"],
        rating: 4.9,
        totalReviews: 247,
        hostType: "captain",
      },
    },
    "business@seafable.com": {
      id: "biz_1",
      firstName: "Ocean",
      lastName: "Adventures",
      email: "business@seafable.com",
      role: "host",
      avatarUrl: "/placeholder.svg?height=150&width=150",
      profileComplete: true,
      businessProfile: {
        companyName: "Ocean Adventures LLC",
        businessType: "Tour Operator",
        yearsInBusiness: 8,
        totalExperiences: 24,
        averageRating: 4.8,
      },
    },
  }

  if (mockUsers[email] && password === "password123") {
    return { success: true, user: mockUsers[email] }
  } else {
    return { success: false, error: "Invalid email or password" }
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const storedAuth = localStorage.getItem("isAuthenticated")
      const storedUser = localStorage.getItem("user")

      if (storedAuth === "true" && storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, userType = "customer") => {
    setIsLoading(true)
    try {
      const response = await mockLoginAPI(email, password, userType)

      if (response.success && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("user", JSON.stringify(response.user))
        localStorage.setItem("userType", userType)
        return { success: true, user: response.user }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    localStorage.removeItem("userType")
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
