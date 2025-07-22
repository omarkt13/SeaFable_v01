
"use client";

import React, { useEffect, useState } from "react";
import { IconWithBackground } from "@/src/ui/components/IconWithBackground";
import { FeatherAnchor } from "@subframe/core";
import { SettingsMenu } from "@/src/ui/components/SettingsMenu";
import { FeatherHome } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";
import { FeatherCalendar } from "@subframe/core";
import { FeatherHandshake } from "@subframe/core";
import { Button } from "@/src/ui/components/Button";
import { FeatherDollarSign } from "@subframe/core";
import { FeatherShapes } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { IconButton } from "@/src/ui/components/IconButton";
import { FeatherBell } from "@subframe/core";
import { DropdownMenu } from "@/src/ui/components/DropdownMenu";
import { FeatherUser } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { TextField } from "@/src/ui/components/TextField";
import { Calendar } from "@/src/ui/components/Calendar";
import { Table } from "@/src/ui/components/Table";
import { FeatherPhone } from "@subframe/core";
import { FeatherMail } from "@subframe/core";
import { Badge } from "@/src/ui/components/Badge";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getHostBookings, type Booking } from "@/lib/database";

export default function BusinessBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchBookings(user.id);
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to view bookings.");
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchBookings = async (hostId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getHostBookings(hostId);
      if (fetchError) {
        throw new Error(fetchError);
      }
      setBookings(data || []);
    } catch (err: any) {
      console.error("Failed to fetch bookings:", err);
      setError(err.message || "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmed</Badge>;
      case "pending":
        return <Badge variant="neutral">Pending</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled_user":
      case "cancelled_host":
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.experiences?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${booking.users?.first_name} ${booking.users?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

  if (isLoading) {
    return (
      <div className="container max-w-none flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="text-gray-500">Loading bookings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-none flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => user?.id && fetchBookings(user.id)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-none flex items-start border border-solid border-neutral-border">
      <div className="flex flex-col items-start gap-8 self-stretch border-r border-solid border-neutral-border bg-default-background px-6 py-8">
        <div className="flex items-center gap-2">
          <IconWithBackground
            variant="warning"
            size="large"
            icon={<FeatherAnchor />}
            square={true}
          />
          <span className="text-heading-2 font-heading-2 text-default-font">
            Business Dashboard
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <SettingsMenu.Item icon={<FeatherHome />} label="Home" />
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-body-bold font-body-bold text-default-font">
            Client Management
          </span>
          <SettingsMenu.Item
            selected={true}
            icon={<FeatherUsers />}
            label="Bookings"
          />
          <SettingsMenu.Item icon={<FeatherAnchor />} label="Experiences" />
          <SettingsMenu.Item icon={<FeatherMessageCircle />} label="Messages" />
          <SettingsMenu.Item icon={<FeatherCalendar />} label="Calendar" />
          <SettingsMenu.Item icon={<FeatherHandshake />} label="Clients" />
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <span className="w-full text-body-bold font-body-bold text-default-font">
            Finance
          </span>
          <div className="flex w-full flex-col items-start gap-1">
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="neutral-tertiary"
              icon={<FeatherDollarSign />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            >
              Sales &amp; Payments
            </Button>
            <SettingsMenu.Item icon={<FeatherShapes />} label="Integrations" />
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-body-bold font-body-bold text-default-font">
            Workspace
          </span>
          <SettingsMenu.Item label="Account" />
          <SettingsMenu.Item icon={<FeatherSettings />} label="Settings" />
        </div>
      </div>
      <div className="flex flex-col items-start px-2 py-2 grow">
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-8 py-4">
          <div className="flex items-center gap-4">
            <IconButton
              icon={<FeatherBell />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  variant="neutral-tertiary"
                  iconRight={<FeatherChevronDown />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Ocean Travel
                </Button>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem icon={<FeatherUser />}>
                      Profile
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherSettings />}>
                      Settings
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownDivider />
                    <DropdownMenu.DropdownItem icon={<FeatherLogOut />}>
                      Logout
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        </div>
        <div className="flex h-320 w-320 flex-none flex-col items-start gap-8 px-8 py-8 overflow-auto">
          <div className="flex w-full items-center justify-between">
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Bookings Overview
                </span>
                <div className="flex items-center gap-4">
                  <TextField className="ml-auto" label="" helpText="">
                    <TextField.Input
                      className="text-left"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchTerm(event.target.value);
                      }}
                    />
                  </TextField>
                  <SubframeCore.Popover.Root>
                    <SubframeCore.Popover.Trigger asChild={true}>
                      <Button
                        variant="neutral-secondary"
                        iconRight={<FeatherCalendar />}
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                      >
                        Select Date Range
                      </Button>
                    </SubframeCore.Popover.Trigger>
                    <SubframeCore.Popover.Portal>
                      <SubframeCore.Popover.Content
                        side="bottom"
                        align="start"
                        sideOffset={4}
                        asChild={true}
                      >
                        <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-3 shadow-lg">
                          <Calendar
                            mode={"single"}
                            selected={selectedDate}
                            onSelect={(date: Date | undefined) => {
                              setSelectedDate(date);
                            }}
                          />
                        </div>
                      </SubframeCore.Popover.Content>
                    </SubframeCore.Popover.Portal>
                  </SubframeCore.Popover.Root>
                  <Button
                    variant="neutral-secondary"
                    iconRight={<FeatherChevronDown />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Filter by Activity
                  </Button>
                </div>
              </div>
              <Table
                header={
                  <Table.HeaderRow>
                    <Table.HeaderCell>Tour</Table.HeaderCell>
                    <Table.HeaderCell>Client</Table.HeaderCell>
                    <Table.HeaderCell>Booking Reference</Table.HeaderCell>
                    <Table.HeaderCell>Date &amp; Time</Table.HeaderCell>
                    <Table.HeaderCell>Booked On</Table.HeaderCell>
                    <Table.HeaderCell>Guests</Table.HeaderCell>
                    <Table.HeaderCell>Contact Info</Table.HeaderCell>
                    <Table.HeaderCell>Sales</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell />
                  </Table.HeaderRow>
                }
              >
                {filteredBookings.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={10}>
                      <div className="text-center py-8">
                        <FeatherCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-gray-700 mb-2">No bookings found.</p>
                        <p className="text-gray-500">
                          {searchTerm ? "Try adjusting your search criteria." : "Start by creating experiences to receive bookings."}
                        </p>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredBookings.map((booking) => (
                    <Table.Row key={booking.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <img
                            className="h-10 w-10 flex-none rounded-md object-cover"
                            src="https://images.unsplash.com/photo-1519681393784-d120267933ba"
                            alt="Experience"
                          />
                          <span className="text-caption font-caption text-subtext-color">
                            {booking.experiences?.title || "Unknown Experience"}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-body-bold font-body-bold text-default-font">
                          {booking.users?.first_name} {booking.users?.last_name}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-body font-body text-neutral-500">
                          {booking.id.slice(0, 8)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-body font-body text-neutral-500">
                          {new Date(booking.booking_date).toLocaleDateString()} {booking.departure_time}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-body font-body text-subtext-color">
                          {new Date(booking.booked_at).toLocaleDateString()}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="grow shrink-0 basis-0 text-body font-body text-neutral-500 text-center flex justify-center">
                          {booking.number_of_guests}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <FeatherPhone className="text-body font-body text-neutral-500" />
                            <span className="text-body font-body text-neutral-500">
                              {booking.users?.phone || "No phone"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FeatherMail className="text-body font-body text-neutral-500" />
                            <span className="text-body font-body text-neutral-500">
                              {booking.users?.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-body-bold font-body-bold text-success-600">
                          €{booking.total_price?.toFixed(2)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(booking.booking_status)}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <IconButton
                            size="small"
                            icon={<FeatherMessageCircle />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          />
                          <IconButton
                            size="small"
                            icon={<FeatherEdit2 />}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                          />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-body font-body text-subtext-color">
                    Total Bookings:
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    {filteredBookings.length}
                  </span>
                  <span className="text-body font-body text-subtext-color">
                    |
                  </span>
                  <span className="text-body font-body text-subtext-color">
                    Total Sales:
                  </span>
                  <div className="flex items-center gap-1">
                    <FeatherDollarSign className="text-body-bold font-body-bold text-success-600" />
                    <span className="text-body-bold font-body-bold text-success-600">
                      {totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton
                    icon={<FeatherChevronLeft />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                  <span className="text-body font-body text-subtext-color">
                    1 of 1
                  </span>
                  <IconButton
                    icon={<FeatherChevronRight />}
                    onClick={(event: React.MouseEvent<HTMLButtonButton>) => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
