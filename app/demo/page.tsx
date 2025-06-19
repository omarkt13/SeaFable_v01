import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 text-white p-4">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Watch Our Demo</h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-10">
          See how SeaFable connects adventurers with unforgettable water experiences.
        </p>
        <div className="relative w-full max-w-2xl mx-auto aspect-video bg-black rounded-xl shadow-2xl overflow-hidden">
          {/* Placeholder for an embedded video */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
            Video Player Placeholder
          </div>
          {/* You would embed a YouTube, Vimeo, or other video player here */}
          {/* Example: <iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe> */}
        </div>
        <Button asChild className="mt-12 bg-white text-teal-600 hover:bg-gray-100">
          <Link href="/">
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
