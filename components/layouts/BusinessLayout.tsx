'use client'

import { BusinessNavigation } from '@/components/navigation/BusinessNavigation'
import { useResponsive, getResponsiveClasses } from '@/hooks/use-responsive'

interface BusinessLayoutProps {
  children: React.ReactNode
}

export function BusinessLayout({ children }: BusinessLayoutProps) {
  const { screenSize } = useResponsive()
  const classes = getResponsiveClasses(screenSize)

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessNavigation />
      <main className="bg-gray-50">
        <div className={classes.container}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default BusinessLayout