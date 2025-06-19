"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessBookingsPage() {
  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Manage Customer Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This page will show all bookings for your experiences, allowing you to confirm, manage, and communicate
              with customers.
            </p>
            <p className="mt-2 text-sm text-gray-500">Content coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
