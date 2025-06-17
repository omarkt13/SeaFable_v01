"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, RefreshCw, Database } from "lucide-react"
import { testDatabaseConnection, getExperiences } from "@/lib/database"
import { supabase } from "@/lib/supabase"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  data?: any
}

export default function DatabaseTestPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const testSuites = [
    {
      name: "Basic Connection",
      test: async () => {
        const result = await testDatabaseConnection()
        return {
          success: result.success,
          message: result.success ? "Database connected successfully" : result.error,
          data: null,
        }
      },
    },
    {
      name: "Users Table",
      test: async () => {
        const { data, error, count } = await supabase.from("users").select("*", { count: "exact" }).limit(5)

        return {
          success: !error,
          message: error ? error.message : `Found ${count} users`,
          data: data?.slice(0, 3),
        }
      },
    },
    {
      name: "Host Profiles Table",
      test: async () => {
        const { data, error, count } = await supabase.from("host_profiles").select("*", { count: "exact" }).limit(5)

        return {
          success: !error,
          message: error ? error.message : `Found ${count} host profiles`,
          data: data?.slice(0, 3),
        }
      },
    },
    {
      name: "Experiences Table",
      test: async () => {
        const result = await getExperiences({ limit: 5 })
        return {
          success: result.success,
          message: result.success ? `Found ${result.data.length} experiences` : result.error,
          data: result.data?.slice(0, 3),
        }
      },
    },
    {
      name: "Bookings Table",
      test: async () => {
        const { data, error, count } = await supabase.from("bookings").select("*", { count: "exact" }).limit(5)

        return {
          success: !error,
          message: error ? error.message : `Found ${count} bookings`,
          data: data?.slice(0, 3),
        }
      },
    },
    {
      name: "Reviews Table",
      test: async () => {
        const { data, error, count } = await supabase.from("reviews").select("*", { count: "exact" }).limit(5)

        return {
          success: !error,
          message: error ? error.message : `Found ${count} reviews`,
          data: data?.slice(0, 3),
        }
      },
    },
    {
      name: "Complex Query Test",
      test: async () => {
        const { data, error } = await supabase
          .from("experiences")
          .select(`
            id,
            title,
            price_per_person,
            rating,
            host_profiles!inner(
              name,
              rating
            )
          `)
          .limit(3)

        return {
          success: !error,
          message: error ? error.message : `Complex join query successful`,
          data: data,
        }
      },
    },
  ]

  const runAllTests = async () => {
    setIsRunning(true)
    setTests([])

    for (const suite of testSuites) {
      // Add pending test
      setTests((prev) => [
        ...prev,
        {
          name: suite.name,
          status: "pending",
          message: "Running...",
        },
      ])

      try {
        const result = await suite.test()

        // Update with result
        setTests((prev) =>
          prev.map((test) =>
            test.name === suite.name
              ? {
                  ...test,
                  status: result.success ? "success" : "error",
                  message: result.message,
                  data: result.data,
                }
              : test,
          ),
        )
      } catch (error) {
        setTests((prev) =>
          prev.map((test) =>
            test.name === suite.name
              ? {
                  ...test,
                  status: "error",
                  message: error.message || "Unknown error",
                }
              : test,
          ),
        )
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Running</Badge>
      case "success":
        return <Badge className="bg-green-600">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length
  const totalTests = testSuites.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Integration Test</h1>
          <p className="text-gray-600">Testing Supabase database connection and data integrity</p>
        </div>

        {/* Test Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
                <div className="text-sm text-gray-500">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-500">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tests.length > 0 ? Math.round((successCount / tests.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>

            <Button onClick={runAllTests} disabled={isRunning} className="w-full">
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <Card key={test.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getStatusIcon(test.status)}
                    {test.name}
                  </CardTitle>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{test.message}</p>

                {test.data && test.status === "success" && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Sample Data:</h4>
                    <pre className="text-xs overflow-x-auto">{JSON.stringify(test.data, null, 2)}</pre>
                  </div>
                )}

                {test.status === "error" && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This test failed. Check your database connection and table structure.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connection Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Connection Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Supabase URL:</span>
                <p className="text-gray-600 break-all">{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              </div>
              <div>
                <span className="font-medium">Environment:</span>
                <p className="text-gray-600">{process.env.NODE_ENV}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
