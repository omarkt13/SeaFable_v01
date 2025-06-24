"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, UserIcon, TrashIcon } from "lucide-react"

export default function BusinessTeamPage() {
  const mockTeamMembers = [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Manager" },
    { id: "2", name: "Bob Williams", email: "bob@example.com", role: "Staff" },
  ]

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Team Management</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Team Member</CardTitle>
            <CardDescription>Invite new members to help manage your business.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="memberName">Name</Label>
              <Input id="memberName" placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="memberEmail">Email</Label>
              <Input id="memberEmail" type="email" placeholder="john.doe@example.com" />
            </div>
            <div>
              <Label htmlFor="memberRole">Role</Label>
              <Select>
                <SelectTrigger id="memberRole">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Button className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" /> Add Team Member
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Team Members</CardTitle>
            <CardDescription>Manage existing team members and their roles.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockTeamMembers.length === 0 ? (
              <p className="text-gray-500">No team members added yet.</p>
            ) : (
              <div className="space-y-4">
                {mockTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 text-sm font-medium bg-gray-100 rounded-full">{member.role}</span>
                      <Button variant="destructive" size="icon">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Remove team member</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
