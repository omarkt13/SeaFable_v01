import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <p className="text-gray-600 mb-6">Reset your password here.</p>
        <Link href="/login" className="text-teal-600 hover:underline">
          Go back to Login
        </Link>
      </div>
    </div>
  )
}
