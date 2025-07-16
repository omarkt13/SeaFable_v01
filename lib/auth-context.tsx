"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client" // Use the client-side Supabase instance with alias
import { getUserProfile, getBusinessProfile, signOut as authUtilsSignOut } from "@/lib/auth-utils" // Import profile fetching and signOut from auth-utils
import type { UserProfile, BusinessProfile } from "@/types/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  businessProfile: BusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
  login: (email: string, password: string, type: string) => Promise<{ success: boolean; user?: User; error?: string }>
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; user?: User; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [userType, setUserType] = useState<"customer" | "business" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserSupabaseClient() // Use the client-side Supabase instance

  const fetchUserAndProfiles = async (currentUser: User | null) => {
    console.log("fetchUserAndProfiles called. Current user:", currentUser?.id);

    if (!currentUser) {
      setUser(null);
      setUserType(null);
      setUserProfile(null);
      setBusinessProfile(null);
      console.log("fetchUserAndProfiles finished. User:", null, "User Type:", null);
      return;
    }

    try {
      // Set user immediately
      setUser(currentUser);

      // Determine user type from metadata
      const userTypeFromMetadata = currentUser.user_metadata?.user_type;
      console.log("User type from metadata:", userTypeFromMetadata);

      if (userTypeFromMetadata === "business") {
        setUserType("business");

        // Fetch business profile
        try {
          const businessData = await getBusinessProfile(currentUser.id);
          console.log("Business profile fetched:", businessData);
          setBusinessProfile(businessData);
          setUserProfile(null);
        } catch (error) {
          console.error("Error fetching business profile:", error);
          setBusinessProfile(null);
        }
      } else {
        setUserType("customer");

        // Fetch customer profile
        try {
          const customerData = await getUserProfile(currentUser.id);
          console.log("Customer profile fetched:", customerData);
          setUserProfile(customerData);
          setBusinessProfile(null);
        } catch (error) {
          console.error("Error fetching customer profile:", error);
          setUserProfile(null);
        }
      }

      console.log("fetchUserAndProfiles finished. User:", currentUser.id, "User Type:", userTypeFromMetadata);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      setUser(currentUser);
      setUserType(null);
      setUserProfile(null);
      setBusinessProfile(null);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial getSession result:", session?.user?.id)
      fetchUserAndProfiles(session?.user || null)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("onAuthStateChange event:", event, "Session user:", session?.user?.id)
      fetchUserAndProfiles(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array ensures this runs once on mount

  const login = async (
    email: string,
    password: string,
    type: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log("Login successful for user:", data.user.id)
        await fetchUserAndProfiles(data.user)
        console.log("After login, userType determined:", userType) // Note: userType might not be updated immediately here due to async state updates

        // Additional check to ensure user logs into the correct portal
        if (type === "customer" && userType === "business") {
          await authUtilsSignOut() // Use the signOut from auth-utils
          return { success: false, error: "Business accounts should use the business login page." }
        }
        if (type === "business" && userType === "customer") {
          await authUtilsSignOut() // Use the signOut from auth-utils
          return { success: false, error: "Customer accounts should use the customer login page." }
        }

        return { success: true, user: data.user }
      }
      return { success: false, error: "Login failed: No user data." }
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred during login." }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // 1. Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: "customer", // Store user type in metadata for quicker lookup
          },
        },
      })

      if (authError) {
        console.error("Sign up auth error:", authError.message)
        return { success: false, error: authError.message }
      }

      if (data.user) {
        console.log("Sign up successful for user:", data.user.id)
        // 2. Insert user profile into 'users' table
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email: data.user.email,
            first_name: firstName,
            last_name: lastName,
            role: "customer", // Assign a default role
          },
        ])

        if (profileError) {
          // If profile creation fails, consider rolling back auth user or logging
          console.error("Error creating user profile:", profileError)
          // Optionally, delete the auth user if profile creation fails
          // await supabase.auth.admin.deleteUser(data.user.id);
          return { success: false, error: profileError.message || "Failed to create user profile." }
        }

        // After successful signup and profile creation, re-fetch profiles and user type
        await fetchUserAndProfiles(data.user)
        return { success: true, user: data.user }
      }

      return { success: false, error: "Sign up failed: No user data." }
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred during sign up." }
    }
  }

  const signOut = async () => {
    await authUtilsSignOut() // Use the signOut from auth-utils
    setUser(null)
    setUserProfile(null)
    setBusinessProfile(null)
    setUserType(null)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, businessProfile, userType, isLoading, login, signUp, signOut }}>
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