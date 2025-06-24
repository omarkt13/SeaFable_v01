"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function BusinessSalesPage() {
  const mockSalesData = [
    { id: "S001", date: "2025-06-20", experience: "Sunset Kayaking", amount: 150.0, status: "Completed" },
    { id: "S002", date: "2025-06-19", experience: "City Food Tour", amount: 200.0, status: "Completed" },
    { id: "S003", date: "2025-06-18", experience: "Mountain Hike", amount: 120.0, status: "Pending" },
    { id: "S004", date: "2025-06-17", experience: "Dolphin Watching", amount: 100.0, status: "Completed" },
  ]

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
            {mockSalesData.length === 0 ? (
              <p className="text-gray-500">No sales data available yet.</p>
            ) : (
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
                  {mockSalesData.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.experience}</TableCell>
                      <TableCell className="text-right">${sale.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={sale.status === "Completed" ? "default" : "secondary"}>{sale.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="mt-4 text-sm text-gray-500">
              (Note: This is a placeholder. Actual sales data will be fetched from the database.)
            </p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
