"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { updateBusinessProfile } from "@/lib/database"
import { useRouter } from "next/navigation"
import { User, Phone, MapPin, Building, ArrowRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/auth-utils" // Import supabase client
import { Button } from "@/components/ui/button"

export default function BusinessOnboardingPage() {
  const { user, businessProfile, isLoading } = useAuth()
  const router = useRouter()

  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && user && businessProfile) {
      if (businessProfile.onboarding_completed) {
        router.push("/business/dashboard") // Redirect if already onboarded
      } else {
        // Pre-fill if data exists
        setContactName(businessProfile.contact_name || "")
        setPhone(businessProfile.phone || "")
        setLocation(businessProfile.location || "")
        setBusinessType(businessProfile.business_type || "")
      }
    }
  }, [isLoading, user, businessProfile, router])

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
      await updateBusinessProfile(user.id, {
        contact_name: contactName,
        phone: phone,
        location: location,
        business_type: businessType,
        onboarding_completed: true, // This is the key update
      })

      // Force a session refresh to update AuthContext state
      const {
        data: { session },
        error: refreshError,
      } = await supabase.auth.refreshSession()
      if (refreshError) {
        console.error("Error refreshing session after onboarding:", refreshError)
        // Even if refresh fails, try to redirect
      }

      console.log("Onboarding successful, attempting redirect to /business/dashboard")
      router.push("/business/dashboard")
    } catch (err: any) {
      console.error("Onboarding submission error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/business/login") // Redirect if not logged in
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-teal-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">SeaFable Business</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Business Profile</h1>
            <p className="text-gray-600">Tell us more about your business to get started on SeaFable.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Onboarding Form */}
          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div>
              <label htmlFor="contactName" className="block text-gray-700 text-sm font-bold mb-2">
                Contact Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="contactName"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
                Business Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  placeholder="City, State/Region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="businessType" className="block text-gray-700 text-sm font-bold mb-2">
                Type of Business
              </label>
              <Select onValueChange={setBusinessType} value={businessType} required>
                <SelectTrigger className="w-full pl-3 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="charter">Charter Company</SelectItem>
                  <SelectItem value="rental">Rental Service</SelectItem>
                  <SelectItem value="school">Sailing/Diving School</SelectItem>
                  <SelectItem value="tour">Tour Operator</SelectItem>
                  <SelectItem value="individual">Individual Host</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  Complete Onboarding <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}