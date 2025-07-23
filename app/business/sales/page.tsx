"use client"

import { useEffect, useState } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getHostEarnings } from "@/lib/supabase-business"

interface SalesRecord {
  id: string
  date: string
  experience: string
  amount: number
  status: string
}

export default function BusinessSalesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [salesData, setSalesData] = useState<SalesRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchSalesData(user.id)
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to view sales data.")
      setIsLoading(false)
    }
  }, [user, authLoading])

  const fetchSalesData = async (hostId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // Re-using getHostEarnings as sales are derived from completed bookings/earnings
      const { data, error: fetchError } = await getHostEarnings(hostId)
      if (fetchError) {
        throw new Error(fetchError.message)
      }

      const formattedSales: SalesRecord[] = (data || [])
        .filter(
          (earning) => earning.bookings?.booking_status === "completed" || earning.bookings?.payment_status === "paid",
        )
        .map((earning) => ({
          id: earning.booking_id, // Use booking_id as transaction ID
          date: new Date(earning.created_at).toLocaleDateString(),
          experience: earning.bookings?.experiences?.title || "N/A",
          amount: earning.amount,
          status: earning.bookings?.booking_status === "completed" ? "Completed" : "Paid", // Or derive from payment_status
        }))

      setSalesData(formattedSales)
    } catch (err: any) {
      console.error("Failed to fetch sales data:", err)
      setError(err.message || "Failed to load sales data.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return "default"
      case "Pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading sales data...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Sales</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => user?.id && fetchSalesData(user.id)}>Try Again</Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Sales Overview</h1>
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Transactions</CardTitle>
            <CardDescription>A summary of your latest sales activities.</CardDescription>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">No sales data available yet.</p>
                <p className="text-gray-500 mb-4">
                  Sales will appear here once bookings are completed and payments are processed.
                </p>
                <Button onClick={() => (window.location.href = "/business/bookings")}>View Bookings</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>{sale.experience}</TableCell>
                        <TableCell className="text-right">€{sale.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(sale.status)}>{sale.status}</Badge>
                        </TableCell>
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