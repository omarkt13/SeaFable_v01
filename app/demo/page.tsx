import Link from "next/link"
import { ChevronLeft, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 text-white p-4">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Discover the Magic of SeaFable: Your Next Water Adventure Awaits
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-10 opacity-90">
          Dive into a world of unforgettable experiences. Watch our demo to see how SeaFable connects adventurers with
          the best water activities, from serene kayaking to thrilling deep-sea diving.
        </p>
        <div className="relative w-full max-w-3xl mx-auto aspect-video bg-black rounded-xl shadow-2xl overflow-hidden border-4 border-white/20">
          {/* Embedded YouTube video placeholder */}
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1&playlist=dQw4w9WgXcQ" // Placeholder YouTube video (Rick Astley)
            title="SeaFable Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors duration-300">
            <PlayCircle className="h-20 w-20 text-white opacity-80" />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 border-white/20 text-white p-6 backdrop-blur-sm">
            <CardContent className="p-0">
              <h3 className="text-xl font-semibold mb-3">Seamless Booking</h3>
              <p className="text-blue-100 text-sm">
                Find, compare, and book your ideal water adventure in just a few clicks. Our intuitive platform makes
                planning effortless.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white p-6 backdrop-blur-sm">
            <CardContent className="p-0">
              <h3 className="text-xl font-semibold mb-3">Trusted Hosts</h3>
              <p className="text-blue-100 text-sm">
                Connect with verified and highly-rated local hosts and operators, ensuring a safe and authentic
                experience every time.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white p-6 backdrop-blur-sm">
            <CardContent className="p-0">
              <h3 className="text-xl font-semibold mb-3">Diverse Adventures</h3>
              <p className="text-blue-100 text-sm">
                From serene paddleboarding to exhilarating jet ski tours, explore a vast array of activities tailored to
                every skill level.
              </p>
            </CardContent>
          </Card>
        </div>

        <Button asChild className="mt-12 bg-white text-teal-600 hover:bg-gray-100 shadow-lg hover:shadow-xl">
          <Link href="/">
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
