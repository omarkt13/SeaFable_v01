"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, DollarSign } from "lucide-react"

interface RecentSalesCardProps {
  totalRevenue: number
  revenueGrowth: number
}

export function RecentSalesCard({ totalRevenue, revenueGrowth }: RecentSalesCardProps) {
  const hasSalesData = totalRevenue > 0

  return (
    <Card className="h-full flex flex-col shadow-sm rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
          Recent sales
          <span className="text-xs text-gray-400">Last 7 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
        {hasSalesData ? (
          <div className="text-center">
            <DollarSign className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
            <p className={`text-sm ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {revenueGrowth >= 0 ? "+" : ""}
              {revenueGrowth.toFixed(1)}% vs last period
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No Sales Data</p>
            <p className="text-xs text-gray-400">Make some appointments for sales data to appear</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
