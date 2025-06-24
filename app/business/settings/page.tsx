"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function BusinessSettingsPage() {
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
                <Input id="businessName" placeholder="SeaFable Adventures" />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" placeholder="info@seafable.com" />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Ocean Drive" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Miami" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="FL" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your business..."
                  className="min-h-[80px]"
                />
              </div>
              <Button>Save Company Info</Button>
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
