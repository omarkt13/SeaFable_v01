"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, EditIcon, EyeIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Experience } from "@/types/business"

export default function BusinessExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await fetch("/api/business/experiences")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch experiences")
        }
        const data = await response.json()
        setExperiences(data.experiences)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "Error fetching experiences",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchExperiences()
  }, [toast])

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Experiences</h1>
          <Link href="/business/experiences/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Create New Experience
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading experiences...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center text-red-500">
              <p>Error: {error}</p>
              <p>Please try refreshing the page.</p>
            </CardContent>
          </Card>
        ) : experiences.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold">No experiences found.</p>
              <p className="text-gray-500">Start by creating your first experience!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <Card key={experience.id}>
                <CardHeader>
                  <CardTitle>{experience.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{experience.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {experience.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Price:</strong> ${experience.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> {experience.duration} minutes
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/experience/${experience.id}`}>
                      <Button variant="outline" size="sm">
                        <EyeIcon className="mr-2 h-4 w-4" /> View
                      </Button>
                    </Link>
                    <Link href={`/business/experiences/edit/${experience.id}`}>
                      <Button variant="outline" size="sm">
                        <EditIcon className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </BusinessLayout>
  )
}
