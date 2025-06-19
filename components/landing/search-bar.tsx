import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Calendar, Users } from "lucide-react"

export function SearchBar() {
  return (
    <div className="bg-white border-b shadow-sm -mt-16 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="What adventure?" className="pl-10 h-11" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Where?" className="pl-10 h-11" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input type="date" className="pl-10 h-11" />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Guests" type="number" min="1" className="pl-10 h-11" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="lg:px-8">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
