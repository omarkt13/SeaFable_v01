"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real application, you would send this data to your backend
    console.log({ name, email, subject, message })

    // Simulate success or failure
    if (Math.random() > 0.2) {
      // 80% success rate
      setSubmitStatus("success")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } else {
      setSubmitStatus("error")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Contact Us</CardTitle>
            <CardDescription className="mt-2 text-gray-600">
              We're here to help! Reach out to us with any questions or feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Inquiry about a booking"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                {submitStatus === "success" && (
                  <p className="text-green-600 text-center mt-2">Your message has been sent successfully!</p>
                )}
                {submitStatus === "error" && (
                  <p className="text-red-600 text-center mt-2">Failed to send message. Please try again.</p>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Details</h3>
                <div className="space-y-3 text-gray-700">
                  <p className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-blue-500" />
                    support@seafable.com
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-blue-500" />
                    +1 (555) 123-4567
                  </p>
                  <p className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                    123 Ocean Drive, Coastal City, CA 90210
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Hours</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>Monday - Friday: 9:00 AM - 6:00 PM (PST)</li>
                  <li>Saturday: 10:00 AM - 4:00 PM (PST)</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">FAQs</h3>
                <p className="text-gray-700">
                  For common questions, please visit our{" "}
                  <Link href="/faq" className="text-blue-600 hover:underline">
                    FAQ page
                  </Link>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
