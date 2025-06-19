"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, ImageIcon, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase" // Ensure this is the client-side supabase instance

export default function CustomerOnboardingPage() {
  const { user, userProfile, isLoading, refreshUserProfile } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && user) {
      if (userProfile?.onboarding_completed) {
        router.push("/dashboard") // Redirect if already onboarded
      } else {
        // Pre-fill if data exists
        setFirstName(userProfile?.first_name || "")
        setLastName(userProfile?.last_name || "")
        setAvatarUrl(userProfile?.avatar_url || "")
      }
    }
  }, [isLoading, user, userProfile, router])

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!user?.id) {
      setError("User not authenticated.")
      setLoading(false)
      return
    }

    try {
      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl || null,
          onboarding_completed: true,
        })
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Refresh the user profile in AuthContext
      await refreshUserProfile()

      console.log("Customer onboarding successful, attempting redirect to /dashboard")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Customer onboarding submission error:", err)
      setError(err.message || "An unexpected error occurred during onboarding.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/login") // Redirect if not logged in
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</CardTitle>
          <p className="text-gray-600">Just a few more details to personalize your SeaFable experience.</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
              <div className="relative mt-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/your-avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  Complete Profile <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
