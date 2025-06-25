"use client"

import { useEffect, useState } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { getBusinessSettings, updateBusinessSettings } from "@/lib/supabase-business"
import { Loader2, AlertCircle, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BusinessOnlineBookingsPage() {
  const { user, businessProfile, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [onlineBookingsEnabled, setOnlineBookingsEnabled] = useState(true)
  const [requireApproval, setRequireApproval] = useState(false)
  const [minBookingNotice, setMinBookingNotice] = useState<number | string>(24)
  const [welcomeMessage, setWelcomeMessage] = useState("")
  const [bookingInstructions, setBookingInstructions] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && businessProfile?.id) {
      loadOnlineBookingSettings(businessProfile.id)
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to manage online booking settings.")
      setIsLoading(false)
    }
  }, [businessProfile, authLoading, user])

  const loadOnlineBookingSettings = async (hostProfileId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: fetchedSettings, error: fetchError } = await getBusinessSettings(hostProfileId)
      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (fetchedSettings) {
        setOnlineBookingsEnabled(fetchedSettings?.online_bookings_enabled ?? true)
        setRequireApproval(fetchedSettings?.require_booking_approval ?? false)
        setMinBookingNotice(fetchedSettings?.min_booking_notice_hours ?? 24)
        setWelcomeMessage(fetchedSettings?.booking_page_welcome_message || "")
        setBookingInstructions(fetchedSettings?.booking_page_instructions || "")
      }
    } catch (err: any) {
      console.error("Failed to load online booking settings:", err)
      setError(err.message || "Failed to load online booking settings.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBookingRules = async () => {
    if (!businessProfile?.id) {
      toast({
        title: "Error",
        description: "Business profile not found.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await updateBusinessSettings(businessProfile.id, {
        online_bookings_enabled: onlineBookingsEnabled,
        require_booking_approval: requireApproval,
        min_booking_notice_hours:
          typeof minBookingNotice === "string" ? Number.parseInt(minBookingNotice) : minBookingNotice,
        booking_page_welcome_message: welcomeMessage,
        booking_page_instructions: bookingInstructions,
      })
      toast({
        title: "Success",
        description: "Online booking settings updated successfully!",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Failed to save online booking settings:", err)
      setError(err.message || "Failed to save online booking settings.")
      toast({
        title: "Error",
        description: err.message || "Failed to save online booking settings.",
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
          <span className="ml-2 text-gray-500">Loading online booking settings...</span>
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
          <Button onClick={() => businessProfile?.id && loadOnlineBookingSettings(businessProfile.id)}>
            Try Again
          </Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Online Booking Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Booking Page Configuration</CardTitle>
              <CardDescription>Customize your public booking page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bookingPageUrl">Your Booking Page URL</Label>
                <Input
                  id="bookingPageUrl"
                  value={`https://seafable.com/book/${businessProfile?.id || "yourbusiness"}`}
                  readOnly
                />
                <p className="text-sm text-gray-500 mt-1">Share this link with your customers.</p>
              </div>
              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  placeholder="Welcome to our booking page!"
                  className="min-h-[80px]"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bookingInstructions">Booking Instructions</Label>
                <Textarea
                  id="bookingInstructions"
                  placeholder="Please arrive 15 minutes early..."
                  className="min-h-[80px]"
                  value={bookingInstructions}
                  onChange={(e) => setBookingInstructions(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveBookingRules} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Page Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>General Booking Rules</CardTitle>
              <CardDescription>Set global rules for your online bookings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="onlineBookingsEnabled">Enable Online Bookings</Label>
                <Switch
                  id="onlineBookingsEnabled"
                  checked={onlineBookingsEnabled}
                  onCheckedChange={setOnlineBookingsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireApproval">Require Manual Approval for Bookings</Label>
                <Switch id="requireApproval" checked={requireApproval} onCheckedChange={setRequireApproval} />
              </div>
              <div>
                <Label htmlFor="minBookingNotice">Minimum Booking Notice (hours)</Label>
                <Input
                  id="minBookingNotice"
                  type="number"
                  placeholder="24"
                  value={minBookingNotice}
                  onChange={(e) => setMinBookingNotice(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">Customers cannot book within this timeframe.</p>
              </div>
              <Button onClick={handleSaveBookingRules} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Booking Rules
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  )
}
