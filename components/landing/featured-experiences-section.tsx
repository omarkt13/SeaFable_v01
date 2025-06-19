import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function FeaturedExperiencesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Featured Experiences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Example Featured Card 1 */}
          <Card>
            <img
              src="/placeholder.jpg?height=300&width=400&query=sailing%20boat"
              alt="Sailing Adventure"
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Sunset Sailing Tour</h4>
              <p className="text-gray-600 mb-4">Experience the breathtaking sunset over the Mediterranean Sea.</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 font-medium">4.9 (120 reviews)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">€85 / person</span>
              </div>
              <Button className="mt-4 w-full">View Details</Button>
            </CardContent>
          </Card>
          {/* Example Featured Card 2 */}
          <Card>
            <img
              src="/placeholder.jpg?height=300&width=400&query=scuba%20diving"
              alt="Scuba Diving"
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Beginner Scuba Diving</h4>
              <p className="text-gray-600 mb-4">Discover the vibrant underwater world with certified instructors.</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 font-medium">4.7 (85 reviews)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">€120 / person</span>
              </div>
              <Button className="mt-4 w-full">View Details</Button>
            </CardContent>
          </Card>
          {/* Example Featured Card 3 */}
          <Card>
            <img
              src="/placeholder.jpg?height=300&width=400&query=kayaking%20river"
              alt="Kayaking"
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Coastal Kayaking Tour</h4>
              <p className="text-gray-600 mb-4">Paddle along stunning coastlines and hidden coves.</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 font-medium">4.8 (150 reviews)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">€60 / person</span>
              </div>
              <Button className="mt-4 w-full">View Details</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
