"use client"

import { useEffect, useState } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getHostEarnings } from "@/lib/supabase-business"

interface HostEarning {
  id: string
  amount: number
  created_at: string
  booking_id: string
  bookings: {
    booking_date: string
    experiences: {
      title: string
    }
  }
}

export default function BusinessEarningsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [earnings, setEarnings] = useState<HostEarning[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0)

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchEarnings(user.id)
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to view earnings.")
      setIsLoading(false)
    }
  }, [user, authLoading])

  const fetchEarnings = async (hostId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getHostEarnings(hostId)
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      setEarnings(data || [])

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      let calculatedTotal = 0
      let calculatedThisMonth = 0
      ;(data || []).forEach((earning) => {
        calculatedTotal += earning.amount
        const earningDate = new Date(earning.created_at)
        if (earningDate.getMonth() === currentMonth && earningDate.getFullYear() === currentYear) {
          calculatedThisMonth += earning.amount
        }
      })

      setTotalEarnings(calculatedTotal)
      setThisMonthEarnings(calculatedThisMonth)
    } catch (err: any) {
      console.error("Failed to fetch earnings:", err)
      setError(err.message || "Failed to load earnings.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading earnings...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Earnings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => user?.id && fetchEarnings(user.id)}>Try Again</Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Earnings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All-time earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{thisMonthEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Earnings for current month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€0.00</div> {/* Placeholder for actual next payout logic */}
              <p className="text-xs text-muted-foreground">Estimated payout date: N/A</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Earnings History</CardTitle>
            <CardDescription>Detailed breakdown of your past earnings.</CardDescription>
          </CardHeader>
          <CardContent>
            {earnings.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">No earnings recorded yet.</p>
                <p className="text-gray-500 mb-4">
                  Earnings will appear here once bookings are completed and payments are processed.
                </p>
                <Button onClick={() => (window.location.href = "/business/bookings")}>View Bookings</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Booking Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell>{new Date(earning.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{earning.bookings?.experiences?.title || "N/A"}</TableCell>
                        <TableCell className="text-right">€{earning.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(earning.bookings?.booking_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
