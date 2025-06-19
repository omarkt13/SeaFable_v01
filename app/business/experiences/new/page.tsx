"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewExperiencePage() {
  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Create New Experience</h1>
        <Card>
          <CardHeader>
            <CardTitle>New Experience Form</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page will provide a form to create and publish a new experience listing for your business.</p>
            <p className="mt-2 text-sm text-gray-500">Content coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
