"use client"

import { useState, useEffect } from "react"
import { Database, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DatabaseDetails {
  connected?: boolean
  tables?: string[]
  lastBackup?: string
  activeConnections?: number
  responseTime?: string
  error?: string
}

export function DatabaseStatus() {
  const [dbStatus, setDbStatus] = useState<{
    status: "checking" | "connected" | "error"
    details: DatabaseDetails | null
  }>({ status: "checking", details: null })

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  const checkDatabaseConnection = async () => {
    setDbStatus({ status: "checking", details: null })

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockStatus = {
        connected: true,
        tables: ["users", "host_profiles", "experiences", "bookings", "reviews"],
        lastBackup: "2025-01-17T10:30:00Z",
        activeConnections: 15,
        responseTime: "45ms",
      }

      setDbStatus({
        status: "connected",
        details: mockStatus,
      })
    } catch (error) {
      setDbStatus({
        status: "error",
        details: { error: error instanceof Error ? error.message : "Unknown error" },
      })
    }
  }

  const StatusIcon = () => {
    switch (dbStatus.status) {
      case "checking":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Database Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon />
            <span className="font-medium capitalize">{dbStatus.status}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={checkDatabaseConnection}
            disabled={dbStatus.status === "checking"}
          >
            {dbStatus.status === "checking" ? "Checking..." : "Refresh"}
          </Button>
        </div>

        {dbStatus.details && dbStatus.status === "connected" && (
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Tables:</span> {dbStatus.details.tables?.length}
              </div>
              <div>
                <span className="font-medium">Response:</span> {dbStatus.details.responseTime}
              </div>
              <div>
                <span className="font-medium">Connections:</span> {dbStatus.details.activeConnections}
              </div>
              <div>
                <span className="font-medium">Last Backup:</span>{" "}
                {dbStatus.details.lastBackup ? new Date(dbStatus.details.lastBackup).toLocaleDateString() : "N/A"}
              </div>
            </div>
            <div className="mt-3">
              <span className="font-medium">Available Tables:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {dbStatus.details.tables?.map((table) => (
                  <span key={table} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {table}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {dbStatus.details && dbStatus.status === "error" && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Connection Error: {dbStatus.details.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
