import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Customer Registration Page</h1>
        <p className="text-gray-600 mb-6">Sign up for a new customer account.</p>
        <Link href="/login" className="text-teal-600 hover:underline">
          Go back to Login
        </Link>
      </div>
    </div>
  )
}
