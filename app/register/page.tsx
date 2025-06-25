"use client"
import CustomerRegisterForm from "@/components/customer-register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Register as a Customer</CardTitle>
          <CardDescription>Create your account to start exploring experiences.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerRegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
