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
  const { user, userType, isLoading: authLoading } = useAuth()
  const [earnings, setEarnings] = useState({
    thisMonth: 0,
    lastMonth: 0,
    thisYear: 0,
    lastYear: 0,
    pending: 0,
    nextPayout: "N/A",
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user || userType !== "business") return

      try {
        setLoading(true)

        const result = await getHostEarnings(user.id)

        if (result.error) {
          console.error("Error fetching earnings:", result.error)
          setError("Failed to load earnings data")
          return
        }

        const bookings = result.data || []

        // Calculate earnings from booking data
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const lastMonth = new Date(currentYear, currentMonth - 1, 1)

        const thisMonthEarnings = bookings
          .filter(b => {
            const bookingDate = new Date(b.booked_at)
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
          })
          .reduce((sum, b) => sum + (b.total_price || 0), 0)

        const lastMonthEarnings = bookings
          .filter(b => {
            const bookingDate = new Date(b.booked_at)
            return bookingDate.getMonth() === lastMonth.getMonth() && bookingDate.getFullYear() === lastMonth.getFullYear()
          })
          .reduce((sum, b) => sum + (b.total_price || 0), 0)

        const thisYearEarnings = bookings
          .filter(b => {
            const bookingDate = new Date(b.booked_at)
            return bookingDate.getFullYear() === currentYear
          })
          .reduce((sum, b) => sum + (b.total_price || 0), 0)

        const lastYearEarnings = bookings
          .filter(b => {
            const bookingDate = new Date(b.booked_at)
            return bookingDate.getFullYear() === (currentYear - 1)
          })
          .reduce((sum, b) => sum + (b.total_price || 0), 0)

        // Recent transactions from bookings
        const recentTransactions = bookings
          .slice(0, 10)
          .map((booking, index) => ({
            id: index + 1,
            customer: "Customer", // Will be populated when user relationships are fixed
            experience: "Experience", // Will be populated when experience relationships are fixed
            amount: booking.total_price || 0,
            date: new Date(booking.booked_at).toLocaleDateString(),
            status: booking.payment_status === "succeeded" ? "completed" : "pending"
          }))

        setEarnings({
          thisMonth: thisMonthEarnings,
          lastMonth: lastMonthEarnings,
          thisYear: thisYearEarnings,
          lastYear: lastYearEarnings,
          pending: 0, // Will be calculated when payment status is properly tracked
          nextPayout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          recentTransactions
        })

        setError(null)
      } catch (error) {
        console.error("Error fetching earnings:", error)
        setError("Failed to load earnings data")
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [user, userType])

  if (loading) {
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
          <Button onClick={() => {}}>Try Again</Button>
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
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{earnings.thisMonth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Earnings for this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{earnings.lastMonth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Earnings from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{earnings.thisYear.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total earnings this year</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A history of your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.experience}</TableCell>
                    <TableCell className="text-right">€{transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{transaction.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}