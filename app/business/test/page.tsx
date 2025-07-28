
"use client"

import { useState, useEffect } from "react"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayoutWrapper } from "@/components/layouts/BusinessLayoutWrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error" | "warning"
  message: string
  details?: string
}

export default function BusinessTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const tests = [
    { name: "Database Connection", test: testDatabaseConnection },
    { name: "User Authentication", test: testAuthentication },
    { name: "Business Profile Access", test: testBusinessProfile },
    { name: "Experience Creation", test: testExperienceCreation },
    { name: "Booking Management", test: testBookingManagement },
    { name: "Dashboard Data", test: testDashboardData },
    { name: "Calendar/Availability", test: testAvailability },
  ]

  async function testDatabaseConnection(): Promise<TestResult> {
    try {
      const response = await fetch("/api/database/test")
      const data = await response.json()
      
      if (data.success) {
        return {
          name: "Database Connection",
          status: "success",
          message: "Database connection successful",
          details: "All required tables are accessible"
        }
      } else {
        return {
          name: "Database Connection",
          status: "error",
          message: "Database connection failed",
          details: data.error
        }
      }
    } catch (error) {
      return {
        name: "Database Connection",
        status: "error",
        message: "Network error",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async function testAuthentication(): Promise<TestResult> {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        return {
          name: "User Authentication",
          status: "success",
          message: "User session is valid",
        }
      } else {
        return {
          name: "User Authentication",
          status: "error",
          message: "Authentication failed",
        }
      }
    } catch (error) {
      return {
        name: "User Authentication",
        status: "error",
        message: "Auth check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async function testBusinessProfile(): Promise<TestResult> {
    try {
      const response = await fetch("/api/business/dashboard")
      const data = await response.json()
      
      if (data.success && data.businessProfile) {
        return {
          name: "Business Profile Access",
          status: "success",
          message: "Business profile loaded successfully",
          details: `Profile: ${data.businessProfile.name || "Unnamed Business"}`
        }
      } else {
        return {
          name: "Business Profile Access",
          status: "error",
          message: "Failed to load business profile",
          details: data.error || "Profile not found"
        }
      }
    } catch (error) {
      return {
        name: "Business Profile Access",
        status: "error",
        message: "Profile access failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async function testExperienceCreation(): Promise<TestResult> {
    try {
      const response = await fetch("/api/business/experiences")
      const data = await response.json()
      
      if (response.ok) {
        return {
          name: "Experience Creation",
          status: "success",
          message: "Experience system accessible",
          details: `Found ${data.experiences?.length || 0} experiences`
        }
      } else {
        return {
          name: "Experience Creation",
          status: "error",
          message: "Experience system failed",
          details: data.error
        }
      }
    } catch (error) {
      return {
        name: "Experience Creation",
        status: "error",
        message: "Experience test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async function testBookingManagement(): Promise<TestResult> {
    try {
      const response = await fetch("/api/business/dashboard")
      const data = await response.json()
      
      if (data.success && data.recentBookings !== undefined) {
        return {
          name: "Booking Management",
          status: "success",
          message: "Booking system operational",
          details: `${data.recentBookings.length} recent bookings found`
        }
      } else {
        return {
          name: "Booking Management",
          status: "warning",
          message: "Booking system accessible but may have issues",
          details: "No booking data or partial data returned"
        }
      }
    } catch (error) {
      return {
        name: "Booking Management",
        status: "error",
        message: "Booking test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async function testDashboardData(): Promise<TestResult> {
    try {
      const response = await fetch("/api/business/dashboard")
      const data = await response.json()
      
      if (data.success && data.overview) {
        return {
          name: "Dashboard Data",
          status: "success",
          message: "Dashboard data loading correctly",
          details: `Revenue: €${data.overview.totalRevenue || 0}, Experiences: ${data.overview.totalExperiences || 0}`
        }
      } else {
        return {
          name: "Dashboard Data",
          status: "error",
          message: "Dashboard data incomplete",
          details: data.error || "Missing overview data"
        }
      }
    } catch (error) {
      return {
        name: "Dashboard Data",
        status: "error",
        message: "Dashboard test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async function testAvailability(): Promise<TestResult> {
    try {
      const response = await fetch("/api/business/availability")
      
      if (response.ok) {
        return {
          name: "Calendar/Availability",
          status: "success",
          message: "Availability system working",
        }
      } else {
        return {
          name: "Calendar/Availability",
          status: "warning",
          message: "Availability system needs setup",
          details: "Calendar functionality may be limited"
        }
      }
    } catch (error) {
      return {
        name: "Calendar/Availability",
        status: "error",
        message: "Availability test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    for (const test of tests) {
      const result = await test.test()
      setTestResults(prev => [...prev, result])
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
      pending: "outline"
    }
    
    return (
      <Badge variant={variants[status] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <BusinessProtectedRoute>
      <BusinessLayoutWrapper title="Business Function Tests">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Function Tests</h1>
                <p className="text-gray-600 mt-1">Verify all business dashboard functions are working correctly</p>
              </div>
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="w-full sm:w-auto"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  "Run All Tests"
                )}
              </Button>
            </div>

            <div className="grid gap-4">
              {tests.map((test, index) => {
                const result = testResults.find(r => r.name === test.name)
                const status = result?.status || (isRunning && index <= testResults.length ? "pending" : "pending")
                
                return (
                  <Card key={test.name} className="transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-3">
                          {getStatusIcon(status)}
                          {test.name}
                        </CardTitle>
                        {getStatusBadge(status)}
                      </div>
                    </CardHeader>
                    {result && (
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                        {result.details && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            {result.details}
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>

            {testResults.length > 0 && !isRunning && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Test Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {testResults.filter(r => r.status === "success").length}
                      </div>
                      <div className="text-sm text-gray-600">Passed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {testResults.filter(r => r.status === "warning").length}
                      </div>
                      <div className="text-sm text-gray-600">Warnings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {testResults.filter(r => r.status === "error").length}
                      </div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => window.open("/api/business/dashboard", "_blank")}>
                Test Dashboard API
              </Button>
              <Button variant="outline" onClick={() => window.open("/business/home", "_blank")}>
                Open Business Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.open("/app/test-db", "_blank")}>
                Database Status
              </Button>
            </div>
          </div>
        </div>
      </BusinessLayoutWrapper>
    </BusinessProtectedRoute>
  )
}
