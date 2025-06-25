"use client"

import { useEffect, useRef } from "react"

export function useCleanup() {
  const cleanupFunctions = useRef<(() => void)[]>([])

  const addCleanup = (fn: () => void) => {
    cleanupFunctions.current.push(fn)
  }

  const addTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(callback, delay)
    addCleanup(() => clearTimeout(timeoutId))
    return timeoutId
  }

  const addInterval = (callback: () => void, delay: number) => {
    const intervalId = setInterval(callback, delay)
    addCleanup(() => clearInterval(intervalId))
    return intervalId
  }

  const addEventListener = (
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions,
  ) => {
    element.addEventListener(event, handler, options)
    addCleanup(() => element.removeEventListener(event, handler, options))
  }

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach((cleanup) => cleanup())
      cleanupFunctions.current = []
    }
  }, [])

  return {
    addCleanup,
    addTimeout,
    addInterval,
    addEventListener,
  }
}
