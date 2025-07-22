
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, Settings, BarChart3, MessageSquare } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "New Adventure",
      description: "Create a new adventure offering",
      icon: Plus,
      href: "/business/adventures/new",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Calendar",
      description: "Manage your schedule",
      icon: Calendar,
      href: "/business/calendar",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Manage Clients",
      description: "View and contact customers",
      icon: Users,
      href: "/business/clients",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Analytics",
      description: "View performance metrics",
      icon: BarChart3,
      href: "/business/reports",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Messages",
      description: "Customer communications",
      icon: MessageSquare,
      href: "/business/messages",
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      title: "Settings",
      description: "Business configuration",
      icon: Settings,
      href: "/business/settings",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
            >
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
