
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BusinessDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual business home page
    router.replace("/business/home");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
