"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  userType: "customer" | "business" | null
  isLoading: boolean
  error: string | null
  login: (
    email: string,
    password: string,
    expectedUserType?: "customer" | "business",
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userType, setUserType] = useState<"customer" | "business" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkUserType = async (userId: string) => {
    try {
      // Check if user is business
      const { data: businessData } = await supabase.from("host_profiles").select("id").eq("id", userId).single()

      if (businessData) {
        setUserType("business")
        return "business"
      }

      // Check if user is customer
      const { data: customerData } = await supabase.from("users").select("id").eq("id", userId).single()

      if (customerData) {
        setUserType("customer")
        return "customer"
      }

      return null
    } catch (error) {
      console.error("Error checking user type:", error)
      return null
    }
  }

  const login = async (email: string, password: string, expectedUserType?: "customer" | "business") => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
      if (!data.user) throw new Error("No user data returned")

      const actualUserType = await checkUserType(data.user.id)

      if (!actualUserType) {
        await supabase.auth.signOut()
        throw new Error("Account not found in system")
      }

      if (expectedUserType && expectedUserType !== actualUserType) {
        await supabase.auth.signOut()
        if (expectedUserType === "business") {
          throw new Error("This account is not registered as a business. Please use customer login.")
        } else {
          throw new Error("This account is registered as a business. Please use business login.")
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message || "Login failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setUserType(null)
      setError(null)
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Failed to sign out")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        checkUserType(session.user.id).then(() => {
          setIsLoading(false)
        })
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (event === "SIGNED_OUT" || !session?.user) {
        setUserType(null)
        setError(null)
        setIsLoading(false)
      } else if (session?.user) {
        await checkUserType(session.user.id)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userType,
        isLoading,
        error,
        login,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
