"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Star, Users, Repeat } from "lucide-react"

export function PerformanceMetrics() {
  // Mock data - replace with real data from your API
  const metrics = [
    {
      title: "Booking Conversion Rate",
      value: 15.8,
      target: 20,
      change: "+2.3%",
      trend: "up",
      icon: Target,
      description: "Visitors who book experiences",
    },
    {
      title: "Customer Satisfaction",
      value: 4.8,
      target: 5.0,
      change: "+0.1",
      trend: "up",
      icon: Star,
      description: "Average rating from reviews",
      isRating: true,
    },
    {
      title: "Repeat Customer Rate",
      value: 32,
      target: 40,
      change: "-1.2%",
      trend: "down",
      icon: Repeat,
      description: "Customers who book again",
    },
    {
      title: "Capacity Utilization",
      value: 78,
      target: 85,
      change: "+5.4%",
      trend: "up",
      icon: Users,
      description: "Adventure slots filled",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className="h-4 w-4 text-gray-600" />
                <span className="font-medium">{metric.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">
                  {metric.isRating ? metric.value.toFixed(1) : `${metric.value}%`}
                </span>
                <Badge variant={metric.trend === "up" ? "default" : "secondary"} className="text-xs">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{metric.description}</span>
                <span>Target: {metric.isRating ? metric.target.toFixed(1) : `${metric.target}%`}</span>
              </div>
              <Progress 
                value={metric.isRating ? (metric.value / metric.target) * 100 : (metric.value / metric.target) * 100} 
                className="h-2"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}