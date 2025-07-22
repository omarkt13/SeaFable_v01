
import { useState, useEffect } from 'react'

export interface BreakpointConfig {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'large-desktop'
  width: number
}

export function useResponsive(): BreakpointConfig {
  const [breakpoint, setBreakpoint] = useState<BreakpointConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    screenSize: 'desktop',
    width: 1024
  })

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < 640) {
        setBreakpoint({
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          isLargeDesktop: false,
          screenSize: 'mobile',
          width
        })
      } else if (width >= 640 && width < 1024) {
        setBreakpoint({
          isMobile: false,
          isTablet: true,
          isDesktop: false,
          isLargeDesktop: false,
          screenSize: 'tablet',
          width
        })
      } else if (width >= 1024 && width < 1536) {
        setBreakpoint({
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          isLargeDesktop: false,
          screenSize: 'desktop',
          width
        })
      } else {
        setBreakpoint({
          isMobile: false,
          isTablet: false,
          isDesktop: false,
          isLargeDesktop: true,
          screenSize: 'large-desktop',
          width
        })
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

export function getResponsiveClasses(screenSize: 'mobile' | 'tablet' | 'desktop' | 'large-desktop') {
  const classes = {
    mobile: {
      container: 'px-3 py-4 max-w-full',
      grid: 'grid-cols-1 gap-3',
      gridAuto: 'grid-cols-1 sm:grid-cols-2 gap-3',
      card: 'p-3 text-sm rounded-lg',
      heading: 'text-lg sm:text-xl',
      subheading: 'text-base sm:text-lg',
      button: 'px-3 py-2 text-sm w-full sm:w-auto',
      spacing: 'space-y-3',
      flex: 'flex-col gap-3',
      flexRow: 'flex-col sm:flex-row gap-3',
      text: 'text-sm',
      iconSize: 'w-4 h-4',
      sidebarWidth: 'w-full',
      modalWidth: 'w-full mx-2'
    },
    tablet: {
      container: 'px-4 py-6 max-w-6xl mx-auto',
      grid: 'grid-cols-2 gap-4',
      gridAuto: 'grid-cols-2 md:grid-cols-3 gap-4',
      card: 'p-4 text-sm rounded-lg',
      heading: 'text-xl md:text-2xl',
      subheading: 'text-lg md:text-xl',
      button: 'px-4 py-2 text-base',
      spacing: 'space-y-4',
      flex: 'flex-col md:flex-row gap-4',
      flexRow: 'flex-row gap-4',
      text: 'text-sm md:text-base',
      iconSize: 'w-5 h-5',
      sidebarWidth: 'w-64',
      modalWidth: 'w-11/12 max-w-2xl'
    },
    desktop: {
      container: 'px-6 py-8 max-w-7xl mx-auto',
      grid: 'grid-cols-3 gap-6',
      gridAuto: 'grid-cols-3 lg:grid-cols-4 gap-6',
      card: 'p-6 rounded-lg',
      heading: 'text-2xl lg:text-3xl',
      subheading: 'text-xl lg:text-2xl',
      button: 'px-4 py-2',
      spacing: 'space-y-6',
      flex: 'flex-row gap-6',
      flexRow: 'flex-row gap-6',
      text: 'text-base',
      iconSize: 'w-6 h-6',
      sidebarWidth: 'w-64',
      modalWidth: 'w-full max-w-4xl'
    },
    'large-desktop': {
      container: 'px-8 py-10 max-w-screen-2xl mx-auto',
      grid: 'grid-cols-4 gap-8',
      gridAuto: 'grid-cols-4 xl:grid-cols-5 gap-8',
      card: 'p-8 rounded-xl',
      heading: 'text-3xl xl:text-4xl',
      subheading: 'text-2xl xl:text-3xl',
      button: 'px-6 py-3',
      spacing: 'space-y-8',
      flex: 'flex-row gap-8',
      flexRow: 'flex-row gap-8',
      text: 'text-lg',
      iconSize: 'w-7 h-7',
      sidebarWidth: 'w-72',
      modalWidth: 'w-full max-w-5xl'
    }
  }

  return classes[screenSize]
}

export function getResponsiveGridCols(itemCount: number, screenSize: 'mobile' | 'tablet' | 'desktop' | 'large-desktop') {
  const maxCols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    'large-desktop': 4
  }

  const cols = Math.min(itemCount, maxCols[screenSize])
  
  const colClasses = {
    mobile: {
      1: 'grid-cols-1'
    },
    tablet: {
      1: 'grid-cols-1 md:grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2'
    },
    desktop: {
      1: 'grid-cols-1 lg:grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    },
    'large-desktop': {
      1: 'grid-cols-1 xl:grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }
  }

  return colClasses[screenSize][cols] || colClasses[screenSize][maxCols[screenSize]]
}
