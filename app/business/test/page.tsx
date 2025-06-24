"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: string
  data?: any
  error?: string
}

interface TestSummary {
  total: number
  passed: number
  failed: number
}

export default function BusinessTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<TestSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/business/test")
      const data = await response.json()
      setTestResults(data.tests)
      setSummary(data.summary)
    } catch (error) {
      console.error("Test failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Portal System Test</h1>
          <p className="text-gray-600">Verify that all business portal components are working correctly</p>
        </div>

        {/* Summary Card */}
        {summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Test Results</CardTitle>
            <Button onClick={runTests} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Running Tests..." : "Run Tests Again"}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Running system tests...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {test.status.includes("✅") ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        {test.error && <p className="text-sm text-red-600">{test.error}</p>}
                        {test.data !== undefined && <p className="text-sm text-gray-600">Data count: {test.data}</p>}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        test.status.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" onClick={() => window.open("/api/business/dashboard", "_blank")}>
            Test Dashboard API
          </Button>
          <Button variant="outline" onClick={() => window.open("/business/dashboard", "_blank")}>
            Open Business Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.open("/app/test-db", "_blank")}>
            Database Status
          </Button>
        </div>
      </div>
    </div>
  )
}
