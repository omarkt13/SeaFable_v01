"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListChecks } from "lucide-react" // Changed from Ship to ListChecks

interface TopService {
  name: string
  thisMonth: number
  lastMonth: number
}

interface TopServicesCardProps {
  topServices: TopService[]
}

export function TopServicesCard({ topServices }: TopServicesCardProps) {
  const hasTopServices = topServices && topServices.length > 0

  return (
    <Card className="h-full flex flex-col shadow-sm rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Top services</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center p-6">
        {hasTopServices ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 text-xs font-semibold text-gray-600 border-b pb-2">
              <div>Service</div>
              <div className="text-right">This month</div>
              <div className="text-right">Last month</div>
            </div>
            {topServices.map((service, index) => (
              <div key={index} className="grid grid-cols-3 text-sm">
                <div>{service.name}</div>
                <div className="text-right">{service.thisMonth}</div>
                <div className="text-right">{service.lastMonth}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <ListChecks className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No services data this month</p>
            <p className="text-xs text-gray-400">Create some experiences for sales data to appear</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
