"use client"

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { getUserProfile, getBusinessProfile, signOut as authUtilsSignOut } from "@/lib/auth-utils"
import type { UserProfile, BusinessProfile } from "@/types/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  businessProfile: BusinessProfile | null
  userType: "customer" | "business" | null
  isLoading: boolean
  loading: boolean  // Add alias for compatibility
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
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Use useMemo to prevent multiple client instances
  const supabase = useMemo(() => createClient(), [])

  const fetchUserAndProfiles = async (currentUser: User | null) => {
    console.log("fetchUserAndProfiles called. Current user:", currentUser?.id);
    setIsLoading(true);

    if (!currentUser) {
      setUser(null);
      setUserType(null);
      setUserProfile(null);
      setBusinessProfile(null);
      setIsLoading(false);
      console.log("fetchUserAndProfiles finished. User:", null, "User Type:", null);
      return;
    }

    // If we already have this user loaded, don't refetch unnecessarily
    if (user && user.id === currentUser.id && userType) {
      console.log("User already loaded, skipping refetch");
      setIsLoading(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true)

    // Get initial session
    const getInitialSession = async () => {
      console.log("Getting initial session...")
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log("Initial getSession result:", session?.user?.id || null, "(attempt 1)")

        if (error) {
          console.error("Error getting session:", error)
        } else {
          await fetchUserAndProfiles(session?.user || null)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log("onAuthStateChange event:", event, "Session user:", session?.user?.id)

      if (event !== 'INITIAL_SESSION') {
        await fetchUserAndProfiles(session?.user || null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (
    email: string,
    password: string,
    type: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Authentication not initialized" };
    }

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

        // Check user type from metadata first
        const userTypeFromMetadata = data.user.user_metadata?.user_type;
        console.log("User type from metadata:", userTypeFromMetadata);

        // Validate user type matches the login portal
        if (type === "business" && userTypeFromMetadata !== "business") {
          await authUtilsSignOut()
          return { success: false, error: "This account is not registered as a business. Please use the customer login or register your business first." }
        }
        if (type === "customer" && userTypeFromMetadata === "business") {
          await authUtilsSignOut()
          return { success: false, error: "Business accounts should use the business login page." }
        }

        //