import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">SeaFable</h4>
          <p className="text-sm">Your gateway to unforgettable water adventures.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/search" className="hover:text-white">
                Explore
              </Link>
            </li>
            <li>
              <Link href="/business/register" className="hover:text-white">
                List Your Experience
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/faq" className="hover:text-white">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
          <p className="text-sm">Follow us on social media for updates and inspiration.</p>
          {/* Social media icons placeholder */}
          <div className="flex space-x-4 mt-3">
            <Link href="#" className="hover:text-white">
              <img src="/placeholder.svg?height=24&width=24" alt="Facebook" />
            </Link>
            <Link href="#" className="hover:text-white">
              <img src="/placeholder.svg?height=24&width=24" alt="Twitter" />
            </Link>
            <Link href="#" className="hover:text-white">
              <img src="/placeholder.svg?height=24&width=24" alt="Instagram" />
            </Link>
          </div>
        </div>
      </div>
      <div className="text-center text-sm mt-10 border-t border-gray-700 pt-8">
        &copy; {new Date().getFullYear()} SeaFable. All rights reserved.
      </div>
    </footer>
  )
}
