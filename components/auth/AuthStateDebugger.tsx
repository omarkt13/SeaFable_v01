
"use client"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

export function AuthStateDebugger() {
  const { user, userType, hostProfile, businessProfile, isLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const info = {
      timestamp: new Date().toISOString(),
      authState: {
        isLoading,
        hasUser: !!user,
        userType,
        userId: user?.id,
        userEmail: user?.email,
        hasHostProfile: !!hostProfile,
        hasBusinessProfile: !!businessProfile
      },
      profiles: {
        hostProfile: hostProfile ? {
          id: hostProfile.id,
          name: hostProfile.name
        } : null,
        businessProfile: businessProfile ? {
          id: businessProfile.id,
          name: businessProfile.name,
          onboarding_completed: businessProfile.onboarding_completed
        } : null
      }
    }
    setDebugInfo(info)
  }, [user, userType, hostProfile, businessProfile, isLoading])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Auth Debug</div>
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}
</new_str>
