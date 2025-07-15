import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function ExperienceCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActivityCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-6">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="text-center animate-pulse">
      <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
      <Skeleton className="h-8 w-16 mx-auto mb-2" />
      <Skeleton className="h-6 w-24 mx-auto mb-2" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  )
}
