"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessSettingsPage() {
  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Business Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Manage Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This page will allow you to update your company details, payout preferences, notification settings, and
              more.
            </p>
            <p className="mt-2 text-sm text-gray-500">Content coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
