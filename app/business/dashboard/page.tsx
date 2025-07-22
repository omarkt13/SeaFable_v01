
"use client";

import { BusinessLayout } from "@/components/layouts/BusinessLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Calendar, Users, DollarSign } from "lucide-react";
import Link from "next/link";

export default function BusinessDashboardPage() {
  return (
    <BusinessLayout>
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-gray-600">Choose where you'd like to go:</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <Home className="h-8 w-8 mx-auto text-blue-600" />
              <CardTitle className="text-lg">Dashboard Home</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/business/home">
                  Go to Home
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <Calendar className="h-8 w-8 mx-auto text-green-600" />
              <CardTitle className="text-lg">Adventures</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/business/experiences">
                  Manage Adventures
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-purple-600" />
              <CardTitle className="text-lg">Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/business/bookings">
                  View Bookings
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <DollarSign className="h-8 w-8 mx-auto text-yellow-600" />
              <CardTitle className="text-lg">Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/business/earnings">
                  Check Earnings
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  );
}
