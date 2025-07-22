"use client"

import { DollarSign, TrendingUp, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface EarningsSummaryProps {
  earnings: {
    thisMonth: number
    lastMonth: number
    pending: number
    nextPayout: { amount: number; date: string }
    monthlyTrend: { month: string; revenue: number }[]
  }
}

export function EarningsSummary({ earnings }: EarningsSummaryProps) {
  // Defensive programming - provide defaults if earnings is undefined
  const earningsWithDefaults = {
    ...earnings,
    thisMonth: earnings?.thisMonth ?? 0,
    lastMonth: earnings?.lastMonth ?? 0,
    pending: earnings?.pending ?? 0,
    nextPayout: earnings?.nextPayout ?? { amount: 0, date: new Date().toLocaleDateString() },
    monthlyTrend: earnings?.monthlyTrend ?? []
  }
  const monthlyGrowth =
    earningsWithDefaults.lastMonth > 0 ? (((earningsWithDefaults.thisMonth - earningsWithDefaults.lastMonth) / earningsWithDefaults.lastMonth) * 100).toFixed(1) : "0.0"
  const growthType = Number.parseFloat(monthlyGrowth) >= 0 ? "increase" : "decrease"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Earnings Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-3xl font-bold text-green-600">${earningsWithDefaults.thisMonth.toLocaleString()}</p>
            <p className={`text-sm flex items-center ${growthType === "increase" ? "text-green-600" : "text-red-600"}`}>
              {growthType === "increase" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
              )}
              {monthlyGrowth}% from last month
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Last Month</p>
              <p className="text-xl font-semibold">${earningsWithDefaults.lastMonth.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-semibold text-yellow-600">${earningsWithDefaults.pending.toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Next Payout</p>
              <Badge variant="secondary">{earningsWithDefaults.nextPayout.date}</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-600">${earningsWithDefaults.nextPayout.amount.toLocaleString()}</p>
            <Button className="w-full mt-3" size="sm" disabled title="Feature Coming Soon">
              <CreditCard className="h-4 w-4 mr-2" />
              View Payout Details
            </Button>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Monthly Revenue Trend</p>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsWithDefaults.monthlyTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}