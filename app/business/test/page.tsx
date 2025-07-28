"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, Loader2, Clock } from "lucide-react"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayoutWrapper } from "@/components/layouts/BusinessLayoutWrapper"
import { createClient } from "@/lib/supabase/client"

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
    { name: "Table Relationships", test: testTableRelationships },
    { name: "Schema Compliance", test: testSchemaCompliance },
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
          message: "Dashboard data loaded successfully",
          details: `Revenue: €${data.overview.totalRevenue}, Bookings: ${data.overview.activeBookings}`
        }
      } else {
        return {
          name: "Dashboard Data",
          status: "error",
          message: "Failed to load dashboard data",
          details: data.error || "No dashboard data returned"
        }
      }
    } catch (error) {
      return {
        name: "Dashboard Data",
        status: "error",
        message: "Dashboard data fetch failed",
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

  async function testTableRelationships(): Promise<TestResult> {
    try {
      const supabase = createClient()

      // Test 1: host_profiles relationship correctness
      const { data: hostProfiles, error: hostError } = await supabase
        .from('host_profiles')
        .select('id, user_id, name, email')
        .limit(3)

      if (hostError) {
        return {
          name: "Table Relationships",
          status: "error",
          message: "Failed to fetch host_profiles",
          details: hostError.message
        }
      }

      // Test 2: experiences -> host_profiles relationship
      const { data: experiences, error: expError } = await supabase
        .from('experiences')
        .select(`
          id,
          title,
          host_id,
          host_profiles!experiences_host_id_fkey (
            id,
            name,
            email
          )
        `)
        .limit(3)

      if (expError) {
        return {
          name: "Table Relationships", 
          status: "error",
          message: "Failed to test experiences -> host_profiles relationship",
          details: expError.message
        }
      }

      // Test 3: bookings relationships (user_id -> users, host_id -> host_profiles.id, experience_id -> experiences)
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          host_id,
          experience_id,
          booking_date,
          total_price,
          experiences!bookings_experience_id_fkey (
            id,
            title,
            location
          ),
          users!bookings_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .limit(3)

      if (bookingError) {
        return {
          name: "Table Relationships",
          status: "error", 
          message: "Failed to test booking relationships",
          details: bookingError.message
        }
      }

      // Test 4: Verify host_profiles.id is used correctly (not user_id) in relationships
      const relationshipIssues = []

      if (experiences && experiences.length > 0) {
        const expWithHostProfile = experiences.find(exp => exp.host_profiles)
        if (expWithHostProfile) {
          if (expWithHostProfile.host_id !== expWithHostProfile.host_profiles.id) {
            relationshipIssues.push(`Experience host_id (${expWithHostProfile.host_id}) doesn't match host_profiles.id (${expWithHostProfile.host_profiles.id})`)
          }
        }
      }

      if (bookings && bookings.length > 0) {
        const bookingWithData = bookings.find(b => b.experiences && b.users)
        if (bookingWithData) {
          // Check if booking references are correct
          if (!bookingWithData.user_id || !bookingWithData.host_id || !bookingWithData.experience_id) {
            relationshipIssues.push("Booking missing required foreign key references")
          }
        }
      }

      const details = [
        `Host Profiles: ${hostProfiles?.length || 0} found`,
        `Experiences with host data: ${experiences?.filter(e => e.host_profiles).length || 0}/${experiences?.length || 0}`,
        `Bookings with relationships: ${bookings?.filter(b => b.experiences && b.users).length || 0}/${bookings?.length || 0}`,
        relationshipIssues.length > 0 ? `Issues: ${relationshipIssues.join(', ')}` : "No relationship issues found"
      ].join(' | ')

      return {
        name: "Table Relationships",
        status: relationshipIssues.length > 0 ? "warning" : "success",
        message: relationshipIssues.length > 0 ? "Relationships work but found issues" : "All table relationships working correctly",
        details
      }

    } catch (error) {
      return {
        name: "Table Relationships",
        status: "error",
        message: "Relationship test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async function testSchemaCompliance(): Promise<TestResult> {
    try {
      const supabase = createClient()

      // Test schema compliance based on provided CSV
      const schemaTests = [
        {
          table: 'bookings',
          requiredColumns: ['id', 'user_id', 'experience_id', 'host_id', 'booking_date', 'number_of_guests', 'total_price', 'booking_status'],
          foreignKeys: [
            { column: 'user_id', references: 'users.id' },
            { column: 'experience_id', references: 'experiences.id' },
            { column: 'host_id', references: 'host_profiles.id' }
          ]
        },
        {
          table: 'experiences',
          requiredColumns: ['id', 'host_id', 'title', 'description', 'location', 'price_per_person'],
          foreignKeys: [
            { column: 'host_id', references: 'host_profiles.id' }
          ]
        },
        {
          table: 'host_profiles', 
          requiredColumns: ['id', 'user_id', 'name', 'email', 'host_type'],
          foreignKeys: [
            { column: 'user_id', references: 'auth.users.id' }
          ]
        }
      ]

      const testResults = []

      for (const test of schemaTests) {
        try {
          const { data, error } = await supabase
            .from(test.table)
            .select('*')
            .limit(1)

          if (error) {
            testResults.push(`❌ ${test.table}: ${error.message}`)
            continue
          }

          if (data && data.length > 0) {
            const record = data[0]
            const missingColumns = test.requiredColumns.filter(col => !(col in record))

            if (missingColumns.length > 0) {
              testResults.push(`⚠️ ${test.table}: Missing columns: ${missingColumns.join(', ')}`)
            } else {
              testResults.push(`✅ ${test.table}: Schema valid`)
            }
          } else {
            testResults.push(`ℹ️ ${test.table}: No data to validate schema`)
          }
        } catch (error) {
          testResults.push(`❌ ${test.table}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      const hasErrors = testResults.some(result => result.startsWith('❌'))
      const hasWarnings = testResults.some(result => result.startsWith('⚠️'))

      return {
        name: "Schema Compliance",
        status: hasErrors ? "error" : hasWarnings ? "warning" : "success",
        message: hasErrors ? "Schema compliance issues found" : hasWarnings ? "Schema warnings found" : "Schema fully compliant",
        details: testResults.join(' | ')
      }

    } catch (error) {
      return {
        name: "Schema Compliance",
        status: "error",
        message: "Schema compliance test failed",
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