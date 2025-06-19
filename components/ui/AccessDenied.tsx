import Link from "next/link"
import { ShieldX } from "lucide-react"

interface AccessDeniedProps {
  userType?: "customer" | "business" | null
  message?: string
}

export function AccessDenied({ userType, message }: AccessDeniedProps) {
  const defaultMessage =
    userType === "business"
      ? "This page is only available to customers. Please visit the business dashboard."
      : "This page is only available to business users. Please log in with a business account."

  const redirectPath = userType === "business" ? "/business/dashboard" : "/business/login"
  const redirectText = userType === "business" ? "Go to Business Dashboard" : "Business Login"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{message || defaultMessage}</p>

          <div className="space-y-3">
            <Link
              href={redirectPath}
              className="block w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
              {redirectText}
            </Link>

            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
