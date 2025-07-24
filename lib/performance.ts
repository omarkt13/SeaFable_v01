
export class PerformanceMonitor {
  private static marks = new Map<string, number>()

  static mark(name: string): void {
    if (typeof performance !== 'undefined') {
      this.marks.set(name, performance.now())
    }
  }

  static measure(name: string, startMark: string): number {
    if (typeof performance === 'undefined') return 0
    
    const startTime = this.marks.get(startMark)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`)
    
    return duration
  }

  static measureAsync<T>(
    name: string, 
    asyncFn: () => Promise<T>
  ): Promise<T> {
    const startMark = `${name}-start`
    this.mark(startMark)
    
    return asyncFn().finally(() => {
      this.measure(name, startMark)
    })
  }
}

// Usage: PerformanceMonitor.measureAsync('fetchUserData', () => fetchUserProfile(userId))
