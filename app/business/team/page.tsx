"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessTeamPage() {
  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Team Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Manage Your Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This page will allow you to add, remove, and manage roles for your team members who help run your business
              on SeaFable.
            </p>
            <p className="mt-2 text-sm text-gray-500">Content coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
