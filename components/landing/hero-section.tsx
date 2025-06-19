import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-20 md:py-32">
      <img
        src="/placeholder.jpg?height=800&width=1600&query=ocean%20adventure%20hero"
        alt="Ocean adventure"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">Unforgettable Water Adventures Await</h2>
        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
          Explore unique sailing, surfing, diving, and fishing experiences curated by local experts.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/search">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Search className="h-5 w-5 mr-2" />
              Explore Experiences
            </Button>
          </Link>
          <Link href="/business/register">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              List Your Experience
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
