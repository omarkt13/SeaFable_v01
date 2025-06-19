"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessExperiencesPage() {
  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Experiences</h1>
        <Card>
          <CardHeader>
            <CardTitle>Manage Your Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This page will display all your active and draft experiences. You can edit, view, or create new ones here.
            </p>
            <p className="mt-2 text-sm text-gray-500">Content coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
