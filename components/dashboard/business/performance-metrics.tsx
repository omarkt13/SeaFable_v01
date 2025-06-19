"use client"

import { Target, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PerformanceMetricsProps {
  analytics: {
    conversionRate: number
    customerSatisfaction: number
    repeatCustomerRate: number
    marketplaceVsDirectRatio: number
    metricsTrend: { name: string; value: number }[]
  }
}

export function PerformanceMetrics({ analytics }: PerformanceMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[200px]">
            <ChartContainer
              config={{
                value: {
                  label: "Percentage",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.metricsTrend} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={5} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Conversion Rate</span>
                <span>{analytics.conversionRate}%</span>
              </div>
              <Progress value={analytics.conversionRate} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Customer Satisfaction</span>
                <span>{analytics.customerSatisfaction}%</span>
              </div>
              <Progress value={analytics.customerSatisfaction} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Repeat Customer Rate</span>
                <span>{analytics.repeatCustomerRate}%</span>
              </div>
              <Progress value={analytics.repeatCustomerRate} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Marketplace vs Direct</span>
                <span>
                  {analytics.marketplaceVsDirectRatio}% / {100 - analytics.marketplaceVsDirectRatio}%
                </span>
              </div>
              <Progress value={analytics.marketplaceVsDirectRatio} />
            </div>
          </div>

          <Button variant="outline" className="w-full" size="sm" disabled title="Feature Coming Soon">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Detailed Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
