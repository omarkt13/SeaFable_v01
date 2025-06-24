"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MailIcon, PhoneIcon } from "lucide-react"

export default function BusinessClientsPage() {
  const mockClients = [
    { id: "C001", name: "John Doe", email: "john.doe@example.com", phone: "555-123-4567", totalBookings: 3 },
    { id: "C002", name: "Jane Smith", email: "jane.smith@example.com", phone: "555-987-6543", totalBookings: 1 },
    { id: "C003", name: "Peter Jones", email: "peter.j@example.com", phone: null, totalBookings: 2 },
  ]

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Clients</h1>
        <Card>
          <CardHeader>
            <CardTitle>Client List</CardTitle>
            <CardDescription>View and manage your customer base.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockClients.length === 0 ? (
              <p className="text-gray-500">No clients found yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Total Bookings</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || "N/A"}</TableCell>
                      <TableCell className="text-right">{client.totalBookings}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" title="Send Email">
                            <MailIcon className="h-4 w-4" />
                          </Button>
                          {client.phone && (
                            <Button variant="outline" size="icon" title="Call Client">
                              <PhoneIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="mt-4 text-sm text-gray-500">
              (Note: This is a placeholder. Actual client data will be fetched from the database.)
            </p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
