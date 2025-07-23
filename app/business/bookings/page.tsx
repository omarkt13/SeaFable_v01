"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, MessageSquare, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface Booking {
  id: string
  guest_name: string
  experience_title: string
  date: string
  time: string
  guests: number
  total_amount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  payment_status: "pending" | "paid" | "refunded"
}

const statusVariants = {
  pending: "secondary",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
} as const

const paymentStatusVariants = {
  pending: "secondary",
  paid: "default",
  refunded: "destructive",
} as const

const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "guest_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Guest Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("guest_name")}</div>,
  },
  {
    accessorKey: "experience_title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Experience
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("experience_title")}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.getValue("date")}</span>
        <span className="text-sm text-muted-foreground">{row.original.time}</span>
      </div>
    ),
  },
  {
    accessorKey: "guests",
    header: "Guests",
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("guests")}</div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusVariants
      return (
        <Badge variant={statusVariants[status]}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "payment_status",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("payment_status") as keyof typeof paymentStatusVariants
      return (
        <Badge variant={paymentStatusVariants[status]}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const booking = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.id)}
            >
              Copy booking ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact guest
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="mr-2 h-4 w-4" />
              Reschedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual Supabase query
      const mockBookings: Booking[] = [
        {
          id: "1",
          guest_name: "John Doe",
          experience_title: "Sunset Sailing Adventure",
          date: "2024-01-15",
          time: "10:00 AM",
          guests: 2,
          total_amount: 150.00,
          status: "confirmed",
          payment_status: "paid",
        },
        {
          id: "2",
          guest_name: "Jane Smith",
          experience_title: "Deep Sea Fishing",
          date: "2024-01-16",
          time: "6:00 AM",
          guests: 4,
          total_amount: 300.00,
          status: "pending",
          payment_status: "pending",
        },
        {
          id: "3",
          guest_name: "Mike Johnson",
          experience_title: "Whale Watching Tour",
          date: "2024-01-14",
          time: "2:00 PM",
          guests: 3,
          total_amount: 225.00,
          status: "completed",
          payment_status: "paid",
        },
      ]
      setBookings(mockBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          Manage and track all your adventure bookings in one place.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bookings.filter(b => b.payment_status === 'paid')
                .reduce((sum, b) => sum + b.total_amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <DataTable
        columns={columns}
        data={bookings}
        title="All Bookings"
        description="A comprehensive list of all adventure bookings."
        searchKey="guest_name"
        searchPlaceholder="Search by guest name..."
      />
    </div>
  )
}