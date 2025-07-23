"use client"

import { useEffect, useState } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MailIcon, PhoneIcon, UserIcon, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getHostBookings } from "@/lib/database" // Using getHostBookings to derive clients

interface ClientData {
  id: string
  name: string
  email: string
  phone: string | null
  totalBookings: number
}

export default function BusinessClientsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [clients, setClients] = useState<ClientData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchClients(user.id)
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to view clients.")
      setIsLoading(false)
    }
  }, [user, authLoading])

  const fetchClients = async (hostId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: bookings, error: fetchError } = await getHostBookings(hostId)
      if (fetchError) {
        throw new Error(fetchError)
      }

      const clientMap = new Map<string, ClientData>()
      ;(bookings || []).forEach((booking) => {
        if (booking.users?.id) {
          const userId = booking.users.id
          if (!clientMap.has(userId)) {
            clientMap.set(userId, {
              id: userId,
              name: `${booking.users.first_name || "Unknown"} ${booking.users.last_name || "User"}`,
              email: booking.users.email || "N/A",
              phone: booking.users.phone || null,
              totalBookings: 0,
            })
          }
          const client = clientMap.get(userId)
          if (client) {
            client.totalBookings += 1
            clientMap.set(userId, client)
          }
        }
      })

      setClients(Array.from(clientMap.values()))
    } catch (err: any) {
      console.error("Failed to fetch clients:", err)
      setError(err.message || "Failed to load clients.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading clients...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Clients</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => user?.id && fetchClients(user.id)}>Try Again</Button>
        </div>
      </BusinessLayout>
    )
  }

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
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">No clients found yet.</p>
                <p className="text-gray-500 mb-4">Clients will appear here once they make a booking with you.</p>
                <Button onClick={() => (window.location.href = "/business/experiences/new")}>
                  Create New Experience
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {clients.map((client) => (
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
                              <a href={`tel:${client.phone}`}>
                                <Button variant="outline" size="icon" title="Call Client">
                                  <PhoneIcon className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                          </div>
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
"use client"

import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayoutWrapper } from "@/components/layouts/BusinessLayoutWrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"

export default function BusinessClientsPage() {
  return (
    <BusinessProtectedRoute>
      <BusinessLayoutWrapper title="Clients">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                <p className="text-gray-600 mt-1">Manage your customer relationships</p>
              </div>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Client List</CardTitle>
                <CardDescription>
                  All your customers and their booking history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 text-center py-8">
                  No clients found. Start by adding your first client.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </BusinessLayoutWrapper>
    </BusinessProtectedRoute>
  )
}
