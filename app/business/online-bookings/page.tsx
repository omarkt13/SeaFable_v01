"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function BusinessOnlineBookingsPage() {
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
                <Input id="bookingPageUrl" value="https://seafable.com/book/yourbusiness" readOnly />
                <p className="text-sm text-gray-500 mt-1">Share this link with your customers.</p>
              </div>
              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea id="welcomeMessage" placeholder="Welcome to our booking page!" className="min-h-[80px]" />
              </div>
              <div>
                <Label htmlFor="bookingInstructions">Booking Instructions</Label>
                <Textarea
                  id="bookingInstructions"
                  placeholder="Please arrive 15 minutes early..."
                  className="min-h-[80px]"
                />
              </div>
              <Button>Save Page Settings</Button>
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
                <Switch id="onlineBookingsEnabled" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireApproval">Require Manual Approval for Bookings</Label>
                <Switch id="requireApproval" />
              </div>
              <div>
                <Label htmlFor="minBookingNotice">Minimum Booking Notice (hours)</Label>
                <Input id="minBookingNotice" type="number" placeholder="24" />
                <p className="text-sm text-gray-500 mt-1">Customers cannot book within this timeframe.</p>
              </div>
              <Button>Save Booking Rules</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  )
}
