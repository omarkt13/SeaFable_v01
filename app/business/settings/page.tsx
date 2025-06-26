"use client"

import { useEffect, useState } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getBusinessSettings, getHostProfile, updateBusinessProfile } from "@/lib/supabase-business"
import { Loader2, AlertCircle, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BusinessSettingsPage() {
  const { user, businessProfile, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [businessName, setBusinessName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  // Add states for payout and notification settings if they were to be implemented here
  // For now, focusing on company info as per existing inputs

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user?.id && businessProfile?.id) {
      loadSettings(user.id, businessProfile.id)
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to manage settings.")
      setIsLoading(false)
    }
  }, [user, businessProfile, authLoading])

  const loadSettings = async (userId: string, hostProfileId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: profileData, error: profileError } = await getHostProfile(userId)
      if (profileError) throw new Error(profileError.message)

      const { data: settingsData, error: settingsError } = await getBusinessSettings(hostProfileId)
      if (settingsError) throw new Error(settingsError.message)

      setBusinessName(profileData.business_name || profileData.name || "")
      setContactEmail(profileData.email || "")
      setPhoneNumber(profileData.phone || "")
      setLocation(profileData.location || "")
      setDescription(profileData.description || "")
    } catch (err: any) {
      console.error("Failed to load settings:", err)
      setError(err.message || "Failed to load business settings.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCompanyInfo = async () => {
    if (!user?.id || !businessProfile?.id) {
      toast({
        title: "Error",
        description: "User not authenticated or business profile not found.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await updateBusinessProfile(user.id, {
        name: businessName, // Update host_profiles.name
        business_name: businessName, // Update host_profiles.business_name
        email: contactEmail,
        phone: phoneNumber,
        location: location,
        description: description,
      })

      // Note: updateBusinessSettings is for host_business_settings table,
      // which currently doesn't hold these fields.
      // If more settings are added to host_business_settings, use it here.

      toast({
        title: "Success",
        description: "Company information updated successfully!",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Failed to save company info:", err)
      setError(err.message || "Failed to save company information.")
      toast({
        title: "Error",
        description: err.message || "Failed to save company information.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading settings...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => user?.id && businessProfile?.id && loadSettings(user.id, businessProfile.id)}>
            Try Again
          </Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Business Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your business name, contact details, and address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="SeaFable Adventures"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="info@seafable.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State/Region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your business..."
                  className="min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveCompanyInfo} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Company Info
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout Preferences</CardTitle>
              <CardDescription>Manage how you receive your earnings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bankAccount">Bank Account Number</Label>
                <Input id="bankAccount" type="text" placeholder="**** **** **** 1234" />
              </div>
              <div>
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input id="routingNumber" type="text" placeholder="XXXXXXX" />
              </div>
              <Button>Update Payout Info</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure your email and SMS notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="emailBookings" className="h-4 w-4" defaultChecked />
                <Label htmlFor="emailBookings">Email me for new bookings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="smsReminders" className="h-4 w-4" />
                <Label htmlFor="smsReminders">SMS reminders for upcoming experiences</Label>
              </div>
              <Button>Save Notifications</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  )
}
