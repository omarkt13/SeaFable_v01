"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, Database, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { testDatabaseConnection, testTableAccess } from "@/lib/database"

export function DatabaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [connectionError, setConnectionError] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [tableStatus, setTableStatus] = useState<Record<string, any>>({})
  const [isTestingTables, setIsTestingTables] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus("checking")
    setConnectionError("")

    try {
      const result = await testDatabaseConnection()

      if (result.success) {
        setConnectionStatus("connected")
      } else {
        setConnectionStatus("error")
        setConnectionError(result.error || "Unknown error")
      }
    } catch (error) {
      setConnectionStatus("error")
      setConnectionError("Network error occurred")
    }
  }

  const testTables = async () => {
    setIsTestingTables(true)
    try {
      const results = await testTableAccess()
      setTableStatus(results)
    } catch (error) {
      console.error("Error testing tables:", error)
    } finally {
      setIsTestingTables(false)
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "checking":
        return "Checking connection..."
      case "connected":
        return "Database connected"
      case "error":
        return `Connection failed: ${connectionError}`
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "checking":
        return "bg-blue-50 border-blue-200"
      case "connected":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
    }
  }

  return (
    <Card className={`mb-8 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Database Status</CardTitle>
            {getStatusIcon()}
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs">
            {isExpanded ? "Hide Details" : "Show Details"}
          </Button>
        </div>
        <CardDescription>{getStatusText()}</CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Table Access Test</span>
              <Button
                variant="outline"
                size="sm"
                onClick={testTables}
                disabled={isTestingTables || connectionStatus !== "connected"}
              >
                {isTestingTables ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Testing...
                  </>
                ) : (
                  "Test Tables"
                )}
              </Button>
            </div>

            {Object.keys(tableStatus).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(tableStatus).map(([table, status]: [string, any]) => (
                  <div key={table} className="flex items-center space-x-2">
                    {status.success ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs font-mono">{table}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <AlertCircle className="h-3 w-3" />
              <span>
                {connectionStatus === "connected"
                  ? "Supabase connection established. Ready for data operations."
                  : "Database connection required for full functionality."}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
