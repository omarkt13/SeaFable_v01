
import { useState, useEffect } from 'react'

export interface BreakpointConfig {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

export function useResponsive(): BreakpointConfig {
  const [breakpoint, setBreakpoint] = useState<BreakpointConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'desktop'
  })

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setBreakpoint({
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          screenSize: 'mobile'
        })
      } else if (width >= 768 && width < 1024) {
        setBreakpoint({
          isMobile: false,
          isTablet: true,
          isDesktop: false,
          screenSize: 'tablet'
        })
      } else {
        setBreakpoint({
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          screenSize: 'desktop'
        })
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

export function getResponsiveClasses(screenSize: 'mobile' | 'tablet' | 'desktop') {
  const classes = {
    mobile: {
      container: 'px-3 py-4',
      grid: 'grid-cols-1 gap-3',
      card: 'p-4 text-sm',
      heading: 'text-xl',
      button: 'px-3 py-2 text-sm',
      spacing: 'space-y-3'
    },
    tablet: {
      container: 'px-4 py-6',
      grid: 'grid-cols-2 gap-4',
      card: 'p-5 text-sm',
      heading: 'text-2xl',
      button: 'px-4 py-2 text-base',
      spacing: 'space-y-4'
    },
    desktop: {
      container: 'px-6 py-8',
      grid: 'grid-cols-3 gap-6',
      card: 'p-6',
      heading: 'text-3xl',
      button: 'px-4 py-2',
      spacing: 'space-y-6'
    }
  }

  return classes[screenSize]
}
