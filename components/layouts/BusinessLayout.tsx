
'use client'

import { useState } from 'react'
import { BusinessSidebar } from '@/components/navigation/BusinessSidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useResponsive, getResponsiveClasses } from '@/hooks/use-responsive'

interface BusinessLayoutProps {
  children: React.ReactNode
}

export function BusinessLayout({ children }: BusinessLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { screenSize } = useResponsive()
  const classes = getResponsiveClasses(screenSize)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <BusinessSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Main content */}
        <main className="flex-1 bg-gray-50">
          <div className={classes.container}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default BusinessLayout
