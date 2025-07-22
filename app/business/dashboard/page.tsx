"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BusinessDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page since dashboard is now merged with home
    router.replace('/business/home')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}