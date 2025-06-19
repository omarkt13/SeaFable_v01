"use client"

import Link from "next/link"
import { Filter, Plus, ChevronRight, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ExperienceData {
  id: string
  title: string
  status: "active" | "inactive"
  bookings: number
  revenue: number
  rating: number
}

interface ExperiencePerformanceProps {
  experiences: ExperienceData[]
}

export function ExperiencePerformance({ experiences }: ExperiencePerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Experience Performance</CardTitle>
          <Button variant="outline" size="sm" disabled title="Feature Coming Soon">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.map((experience) => (
              <div key={experience.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{experience.title}</h4>
                    <Badge variant={experience.status === "active" ? "default" : "secondary"}>
                      {experience.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{experience.bookings}</span> bookings
                    </div>
                    <div>
                      <span className="font-medium">${experience.revenue.toLocaleString()}</span> revenue
                    </div>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-400" />
                      <span>{experience.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/business/experiences?id=${experience.id}`} title="View Experience Details">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">No experiences created yet.</div>
        )}
        <Button variant="outline" className="w-full mt-4" asChild>
          <Link href="/business/experiences/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Experience
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
