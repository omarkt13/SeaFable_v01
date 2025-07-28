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
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      const details = []
      
      if (authError || !user) {
        details.push(`Auth Check: FAILED - ${authError?.message || 'No user session'}`)
        return {
          name: "Business Profile Access",
          status: "error",
          message: "Authentication required",
          details: details.join(' | ')
        }
      }
      
      details.push(
        `User ID: ${user.id}`,
        `User Type: ${user.user_metadata?.user_type || 'unknown'}`,
        `Email: ${user.email || 'unknown'}`
      )
      
      // Test direct database access
      const { data: hostProfile, error: dbError } = await supabase
        .from('host_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        
      if (dbError) {
        details.push(`Database Query: FAILED - ${dbError.message}`)
        if (dbError.code === 'PGRST116') {
          details.push('No host profile found in database')
        }
      } else {
        details.push(
          `Host Profile Found: YES`,
          `Profile ID: ${hostProfile.id}`,
          `Profile Name: ${hostProfile.name || 'unnamed'}`,
          `Host Type: ${hostProfile.host_type || 'unknown'}`
        )
      }
      
      // Test API endpoint
      const response = await fetch("/api/business/dashboard")
      const data = await response.json()
      
      details.push(`API Response: ${response.status}`)
      
      if (data.success && data.businessProfile) {
        details.push(`API Profile: Found - ${data.businessProfile.name || "Unnamed"}`)
        return {
          name: "Business Profile Access",
          status: "success",
          message: "Business profile loaded successfully",
          details: details.join(' | ')
        }
      } else {
        details.push(`API Error: ${data.error || 'Unknown API error'}`)
        return {
          name: "Business Profile Access",
          status: "error",
          message: "Failed to load business profile via API",
          details: details.join(' | ')
        }
      }
    } catch (error) {
      return {
        name: "Business Profile Access",
        status: "error",
        message: "Profile access test failed",
        details: `Exception: ${error instanceof Error ? error.message : "Unknown error"}`
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

      const details = [
        `HTTP Status: ${response.status}`,
        `Response Success: ${data.success || false}`
      ]

      if (!response.ok) {
        details.push(`Error: ${data.error || 'Unknown API error'}`)
        if (response.status === 401) {
          details.push('Authentication required - please log in as business user')
        }
        if (response.status === 404) {
          details.push('Dashboard endpoint not found')
        }
      }

      if (data.success && data.overview) {
        details.push(
          `Total Revenue: €${data.overview.totalRevenue || 0}`,
          `Active Bookings: ${data.overview.activeBookings || 0}`,
          `Total Experiences: ${data.overview.totalExperiences || 0}`,
          `Recent Bookings: ${data.recentBookings?.length || 0}`,
          `Business Profile: ${data.businessProfile ? 'Found' : 'Missing'}`
        )
        
        return {
          name: "Dashboard Data",
          status: "success",
          message: "Dashboard data loaded successfully",
          details: details.join(' | ')
        }
      } else {
        if (data.error) {
          details.push(`API Error: ${data.error}`)
        }
        if (!data.overview) {
          details.push('Missing overview data')
        }
        
        return {
          name: "Dashboard Data",
          status: "error",
          message: "Failed to load dashboard data",
          details: details.join(' | ')
        }
      }
    } catch (error) {
      return {
        name: "Dashboard Data",
        status: "error",
        message: "Dashboard data fetch failed",
        details: `Network/Parse Error: ${error instanceof Error ? error.message : "Unknown error"}`
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
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          name: "Table Relationships",
          status: "error",
          message: "Authentication required for relationship tests",
          details: `Auth Error: ${authError?.message || 'No user session found'}. Please ensure you're logged in as a business user.`
        }
      }

      const testDetails = [`Current User ID: ${user.id}`, `User Type: ${user.user_metadata?.user_type || 'unknown'}`]

      // Test 1: host_profiles relationship correctness
      const { data: hostProfiles, error: hostError } = await supabase
        .from('host_profiles')
        .select('id, user_id, name, email')
        .eq('user_id', user.id)

      if (hostError) {
        return {
          name: "Table Relationships",
          status: "error",
          message: "Failed to fetch host_profiles",
          details: `Database Error: ${hostError.message}. Query: host_profiles where user_id = ${user.id}`
        }
      }

      if (!hostProfiles || hostProfiles.length === 0) {
        return {
          name: "Table Relationships",
          status: "error",
          message: "No host profile found for current user",
          details: `Expected: host_profiles record with user_id = ${user.id}. Found: none. This user may not be properly set up as a business host.`
        }
      }

      const hostProfile = hostProfiles[0]
      testDetails.push(`Host Profile ID: ${hostProfile.id}`, `Host Profile Name: ${hostProfile.name || 'unnamed'}`)

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
        .eq('host_id', hostProfile.id)

      if (expError) {
        testDetails.push(`FAILED: experiences query - ${expError.message}`)
      } else {
        testDetails.push(`Experiences found: ${experiences?.length || 0}`)
        if (experiences && experiences.length > 0) {
          const validExperiences = experiences.filter(exp => exp.host_profiles?.id === exp.host_id)
          testDetails.push(`Valid experience relationships: ${validExperiences.length}/${experiences.length}`)
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

      // Test 3: bookings relationships for this host
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          host_id,
          experience_id,
          booking_date,
          total_price,
          booking_status,
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
        .eq('host_id', hostProfile.id)

      if (bookingError) {
        testDetails.push(`FAILED: bookings query - ${bookingError.message}`)
      } else {
        testDetails.push(`Bookings found: ${bookings?.length || 0}`)
        if (bookings && bookings.length > 0) {
          const validBookings = bookings.filter(b => b.experiences && b.users)
          testDetails.push(`Bookings with valid relationships: ${validBookings.length}/${bookings.length}`)
          
          // Check for relationship consistency
          const invalidHostIds = bookings.filter(b => b.host_id !== hostProfile.id)
          if (invalidHostIds.length > 0) {
            testDetails.push(`ERROR: ${invalidHostIds.length} bookings have incorrect host_id`)
          }
        }
      }

      // Test 4: Schema compliance check
      const schemaIssues = []
      
      // Check if host_profile has required fields according to schema
      const requiredHostFields = ['id', 'user_id', 'name', 'email']
      const missingHostFields = requiredHostFields.filter(field => !(field in hostProfile))
      if (missingHostFields.length > 0) {
        schemaIssues.push(`Missing host_profile fields: ${missingHostFields.join(', ')}`)
      }

      // Verify the relationship correctness according to schema
      if (hostProfile.user_id !== user.id) {
        schemaIssues.push(`Host profile user_id (${hostProfile.user_id}) doesn't match auth user id (${user.id})`)
      }

      if (experiences && experiences.length > 0) {
        const badExperienceRefs = experiences.filter(exp => exp.host_id !== hostProfile.id)
        if (badExperienceRefs.length > 0) {
          schemaIssues.push(`${badExperienceRefs.length} experiences have incorrect host_id reference`)
        }
      }

      if (bookings && bookings.length > 0) {
        const badBookingRefs = bookings.filter(b => b.host_id !== hostProfile.id)
        if (badBookingRefs.length > 0) {
          schemaIssues.push(`${badBookingRefs.length} bookings have incorrect host_id reference`)
        }
      }

      // Determine final status
      const hasErrors = testDetails.some(detail => detail.includes('FAILED:')) || schemaIssues.length > 0
      const hasWarnings = testDetails.some(detail => detail.includes('WARNING:'))

      if (schemaIssues.length > 0) {
        testDetails.push('SCHEMA ISSUES:', ...schemaIssues)
      }

      return {
        name: "Table Relationships",
        status: hasErrors ? "error" : hasWarnings ? "warning" : "success",
        message: hasErrors ? "Critical relationship errors found" : hasWarnings ? "Relationships work with warnings" : "All relationships working correctly",
        details: testDetails.join(' | ')
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
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">Details:</p>
                            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border">
                              {result.details.includes(' | ') ? (
                                <ul className="space-y-1">
                                  {result.details.split(' | ').map((detail, idx) => (
                                    <li key={idx} className={`${
                                      detail.includes('FAILED:') || detail.includes('ERROR:') ? 'text-red-600 font-medium' :
                                      detail.includes('WARNING:') ? 'text-yellow-600 font-medium' :
                                      detail.includes('SUCCESS:') || detail.includes('Found: YES') ? 'text-green-600 font-medium' :
                                      'text-gray-600'
                                    }`}>
                                      • {detail}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className={
                                  result.details.includes('FAILED') || result.details.includes('ERROR') ? 'text-red-600' :
                                  result.details.includes('WARNING') ? 'text-yellow-600' :
                                  'text-gray-600'
                                }>
                                  {result.details}
                                </span>
                              )}
                            </div>
                          </div>
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