
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function BusinessDashboardPage() {
  const router = useRouter()
  const { user, userType, isLoading } = useAuth()

  useEffect(() => {
    // Only redirect after auth state is confirmed
    if (!isLoading) {
      if (!user) {
        router.replace("/business/login")
      } else if (userType === "business") {
        router.replace("/business/home")
      } else if (userType === "customer") {
        router.replace("/business/register")
      }
    }
  }, [router, user, userType, isLoading])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">
          {isLoading ? "Loading..." : "Redirecting to dashboard..."}
        </p>
      </div>
    </div>
  )
}
