"use client"

import { useEffect, useState } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, UserIcon, TrashIcon, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getHostTeamMembers } from "@/lib/supabase-business"
import { Users } from "lucide-react" // Import Users icon

interface TeamMember {
  id: string
  user_id: string
  host_profile_id: string
  role: string
  is_active: boolean
  created_at: string
  users: {
    first_name: string
    last_name: string
    email: string
    avatar_url: string | null
  } | null
}

export default function BusinessTeamPage() {
  const { user, businessProfile, isLoading: authLoading } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for adding new team member (simplified for now)
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("")

  useEffect(() => {
    if (!authLoading && businessProfile?.id) {
      fetchTeamMembers(businessProfile.id)
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to manage your team.")
      setIsLoading(false)
    }
  }, [businessProfile, authLoading, user])

  const fetchTeamMembers = async (hostProfileId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getHostTeamMembers(hostProfileId)
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      setTeamMembers(data || [])
    } catch (err: any) {
      console.error("Failed to fetch team members:", err)
      setError(err.message || "Failed to load team members.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTeamMember = () => {
    // This would typically involve a server action or API call to invite a new user
    // For now, it's a placeholder.
    console.log("Adding team member:", { newMemberName, newMemberEmail, newMemberRole })
    // After successful addition, refetch team members:
    // if (businessProfile?.id) fetchTeamMembers(businessProfile.id);
  }

  const handleRemoveTeamMember = (memberId: string) => {
    // This would typically involve a server action or API call to deactivate/remove a team member
    console.log("Removing team member:", memberId)
    // After successful removal, refetch team members:
    // if (businessProfile?.id) fetchTeamMembers(businessProfile.id);
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading team members...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Team</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => businessProfile?.id && fetchTeamMembers(businessProfile.id)}>Try Again</Button>
        </div>
      </BusinessLayout>
    )
  }

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
              <Input
                id="memberName"
                placeholder="John Doe"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="memberEmail">Email</Label>
              <Input
                id="memberEmail"
                type="email"
                placeholder="john.doe@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="memberRole">Role</Label>
              <Select onValueChange={setNewMemberRole} value={newMemberRole}>
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
              <Button className="w-full" onClick={handleAddTeamMember}>
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
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">No team members added yet.</p>
                <p className="text-gray-500 mb-4">Add your first team member using the form above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="font-semibold">
                          {member.users?.first_name} {member.users?.last_name || member.users?.email}
                        </p>
                        <p className="text-sm text-gray-500">{member.users?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 text-sm font-medium bg-gray-100 rounded-full">{member.role}</span>
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveTeamMember(member.id)}>
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
