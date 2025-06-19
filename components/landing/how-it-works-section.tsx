import { Card } from "@/components/ui/card"
import { Search, Calendar, Award } from "lucide-react"

export function HowItWorksSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-12">How SeaFable Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 flex flex-col items-center text-center">
            <Search className="h-12 w-12 text-blue-600 mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">1. Discover</h4>
            <p className="text-gray-600">Browse hundreds of unique water experiences by location, activity, or date.</p>
          </Card>
          <Card className="p-6 flex flex-col items-center text-center">
            <Calendar className="h-12 w-12 text-blue-600 mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">2. Book</h4>
            <p className="text-gray-600">
              Secure your adventure with instant booking or direct communication with hosts.
            </p>
          </Card>
          <Card className="p-6 flex flex-col items-center text-center">
            <Award className="h-12 w-12 text-blue-600 mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">3. Experience</h4>
            <p className="text-gray-600">Enjoy your unforgettable water adventure led by certified local experts.</p>
          </Card>
        </div>
      </div>
    </section>
  )
}
