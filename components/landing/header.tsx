import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Anchor } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Anchor className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SeaFable</span>
            </Link>
            <div className="hidden md:block h-6 w-px bg-gray-300" />
            <h1 className="hidden md:block text-lg font-semibold text-gray-900">Discover Water Adventures</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost">List Your Experience</Button>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
