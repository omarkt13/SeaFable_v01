
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PublicNavigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SeaFable</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/search"
              className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              Discover Adventures
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/business/login"
              className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              List Your Business
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-teal-600 text-white hover:bg-teal-700">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
