"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"

export default function BusinessReportsPage() {
  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
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

          <Card>
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

          <Card>
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
