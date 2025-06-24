"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Users } from "lucide-react"

interface TopTeamMemberCardProps {
  topTeamMemberName: string
  topTeamMemberSales: number
}

export function TopTeamMemberCard({ topTeamMemberName, topTeamMemberSales }: TopTeamMemberCardProps) {
  const hasTeamMemberData = topTeamMemberSales > 0

  return (
    <Card className="h-full flex flex-col shadow-sm rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Top team member</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
        {hasTeamMemberData ? (
          <div className="text-center">
            <Users className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-3xl font-bold">{topTeamMemberName}</p>
            <p className="text-sm text-gray-600">
              Generated <span className="font-semibold">${topTeamMemberSales.toLocaleString()}</span> in sales
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No sales this month</p>
            <p className="text-xs text-gray-400">Create some sales for sales data to appear</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
