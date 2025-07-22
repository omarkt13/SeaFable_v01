"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"

export default function BusinessReportsPage() {
  return (
    <BusinessLayout>
        <div className="space-y-6 lg:space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">View detailed insights about your business performance</p>
            </div>
          </div>

          <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>Detailed breakdown of your sales and revenue.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <p>Generate a report for a specific period to analyze your sales performance.</p>
              <Button variant="outline">
                <DownloadIcon className="mr-2 h-4 w-4" /> Download Sales Report
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Booking Activity Report</CardTitle>
              <CardDescription>Overview of all bookings, cancellations, and completions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <p>Track booking trends and manage your schedule effectively.</p>
              <Button variant="outline">
                <DownloadIcon className="mr-2 h-4 w-4" /> Download Booking Report
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Client Data Report</CardTitle>
              <CardDescription>Information about your clients and their booking history.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <p>Understand your customer base better with detailed client data.</p>
              <Button variant="outline">
                <DownloadIcon className="mr-2 h-4 w-4" /> Download Client Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  )
}