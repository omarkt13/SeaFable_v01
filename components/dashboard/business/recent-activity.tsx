"use client"

import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecentActivityProps {
  recentActivity: { description: string; time: string; color: string }[]
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">No recent activity.</div>
        )}
        <Button variant="outline" className="w-full mt-4" size="sm" disabled title="Feature Coming Soon">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  )
}
