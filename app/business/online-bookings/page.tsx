"use client"

import { useEffect, useState } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { getBusinessSettings, updateBusinessSettings } from "@/lib/supabase-business"
import { Loader2, AlertCircle, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { BusinessSettings } from "@/types/business"

export default function BusinessOnlineBookingsPage() {
  const { user, businessProfile, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [minBookingNoticeHours, setMinBookingNoticeHours] = useState(24)
  const [maxBookingAdvanceDays, setMaxBookingAdvanceDays] = useState(365)
  const [requireBookingApproval, setRequireBookingApproval] = useState(false)
  const [autoConfirmBookings, setAutoConfirmBookings] = useState(true)
  const [cancellationPolicy, setCancellationPolicy] = useState("")
  const [refundPolicy, setRefundPolicy] = useState("")
  const [bookingConfirmationMessage, setBookingConfirmationMessage] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [timezone, setTimezone] = useState("America/New_York")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user?.id && businessProfile?.id) {
      loadSettings(businessProfile.id)
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to manage online booking settings.")
      setIsLoading(false)
    } else if (!authLoading && user?.id && !businessProfile?.id) {
      setError("Business profile not found for the logged-in user.")
      setIsLoading(false)
    }
  }, [user, businessProfile, authLoading])

  const loadSettings = async (hostProfileId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const settingsData = await getBusinessSettings(hostProfileId)

      if (settingsData) {
        setMinBookingNoticeHours(settingsData.min_booking_notice_hours ?? 24)
        setMaxBookingAdvanceDays(settingsData.max_booking_advance_days ?? 365)
        setRequireBookingApproval(settingsData.require_booking_approval ?? false)
        setAutoConfirmBookings(settingsData.auto_confirm_bookings ?? true)
        setCancellationPolicy(settingsData.cancellation_policy ?? "")
        setRefundPolicy(settingsData.refund_policy ?? "")
        setBookingConfirmationMessage(settingsData.booking_confirmation_message ?? "")
        setCurrency(settingsData.currency ?? "USD")
        setTimezone(settingsData.timezone ?? "America/New_York")
      } else {
        // Initialize with default values if no settings found
        setMinBookingNoticeHours(24)
        setMaxBookingAdvanceDays(365)
        setRequireBookingApproval(false)
        setAutoConfirmBookings(true)
        setCancellationPolicy("")
        setRefundPolicy("")
        setBookingConfirmationMessage("")
        setCurrency("USD")
        setTimezone("America/New_York")
      }
    } catch (err: any) {
      console.error("Failed to load online booking settings:", err)
      setError(err.message || "Failed to load online booking settings.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
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
      const settingsToSave: Partial<BusinessSettings> = {
        min_booking_notice_hours: minBookingNoticeHours,
        max_booking_advance_days: maxBookingAdvanceDays,
        require_booking_approval: requireBookingApproval,
        auto_confirm_bookings: autoConfirmBookings,
        cancellation_policy: cancellationPolicy,
        refund_policy: refundPolicy,
        booking_confirmation_message: bookingConfirmationMessage,
        currency: currency,
        timezone: timezone,
      }

      await updateBusinessSettings(businessProfile.id, settingsToSave)

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
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading online booking settings...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => businessProfile?.id && loadSettings(businessProfile.id)}>Try Again</Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Online Booking Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Booking Rules</CardTitle>
              <CardDescription>Define general rules for how customers can book your experiences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="minBookingNotice">Minimum Booking Notice (hours)</Label>
                <Input
                  id="minBookingNotice"
                  type="number"
                  value={minBookingNoticeHours}
                  onChange={(e) => setMinBookingNoticeHours(Number.parseInt(e.target.value))}
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Customers cannot book an experience less than this many hours in advance.
                </p>
              </div>
              <div>
                <Label htmlFor="maxBookingAdvance">Maximum Booking Advance (days)</Label>
                <Input
                  id="maxBookingAdvance"
                  type="number"
                  value={maxBookingAdvanceDays}
                  onChange={(e) => setMaxBookingAdvanceDays(Number.parseInt(e.target.value))}
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Customers cannot book an experience more than this many days in advance.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requireApproval"
                  checked={requireBookingApproval}
                  onCheckedChange={(checked) => setRequireBookingApproval(Boolean(checked))}
                />
                <Label htmlFor="requireApproval">Require manual approval for all bookings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoConfirm"
                  checked={autoConfirmBookings}
                  onCheckedChange={(checked) => setAutoConfirmBookings(Boolean(checked))}
                />
                <Label htmlFor="autoConfirm">Automatically confirm bookings (if not requiring approval)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policies & Messages</CardTitle>
              <CardDescription>Set your cancellation, refund policies, and confirmation messages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  placeholder="e.g., 'Full refund for cancellations made 24 hours in advance.'"
                  className="min-h-[80px]"
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="refundPolicy">Refund Policy</Label>
                <Textarea
                  id="refundPolicy"
                  placeholder="e.g., 'No refunds for no-shows or cancellations within 12 hours.'"
                  className="min-h-[80px]"
                  value={refundPolicy}
                  onChange={(e) => setRefundPolicy(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmationMessage">Booking Confirmation Message</Label>
                <Textarea
                  id="confirmationMessage"
                  placeholder="This message will be sent to customers after a successful booking."
                  className="min-h-[80px]"
                  value={bookingConfirmationMessage}
                  onChange={(e) => setBookingConfirmationMessage(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure currency and timezone for your bookings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - United States Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </BusinessLayout>
  )
}
