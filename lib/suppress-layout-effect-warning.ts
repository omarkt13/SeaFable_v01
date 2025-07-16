
// Utility to suppress useLayoutEffect warnings in development
// This is a common issue with Radix UI components in Next.js SSR

if (typeof window === 'undefined') {
  // We're on the server, suppress the warning
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('useLayoutEffect does nothing on the server')
    ) {
      return;
    }
    originalError(...args);
  };
}

export {};
