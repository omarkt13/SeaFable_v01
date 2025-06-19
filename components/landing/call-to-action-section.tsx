import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CallToActionSection() {
  return (
    <section className="bg-blue-700 text-white py-16 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready for Your Next Adventure?</h3>
        <p className="text-lg mb-8">
          Join SeaFable today and start exploring the world's most incredible water experiences.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
              Sign Up Now
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
