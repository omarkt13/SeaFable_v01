"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessEarningsPage() {
  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Earnings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page will provide a detailed breakdown of your earnings, payout history, and financial reports.</p>
            <p className="mt-2 text-sm text-gray-500">Content coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
