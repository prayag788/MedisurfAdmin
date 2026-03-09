import { useEffect, useRef } from 'react'

// React 18 Performance Monitoring Hook
export const usePerformanceMonitoring = componentName => {
  const renderStartTime = useRef()
  const mountStartTime = useRef()

  useEffect(() => {
    // Track component mount time
    mountStartTime.current = performance.now()

    return () => {
      // Log component unmount time
      const mountDuration = performance.now() - mountStartTime.current
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} mounted for ${mountDuration.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  useEffect(() => {
    // Track render performance
    renderStartTime.current = performance.now()

    // Use requestIdleCallback for non-blocking performance logging
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        const renderDuration = performance.now() - renderStartTime.current
        if (process.env.NODE_ENV === 'development' && renderDuration > 16) {
          // Only log slow renders (>16ms)
          console.warn(`[Performance] ${componentName} slow render: ${renderDuration.toFixed(2)}ms`)
        }
      })
    }
  })

  return {
    markRenderStart: () => {
      renderStartTime.current = performance.now()
    },
    markRenderEnd: () => {
      const renderDuration = performance.now() - renderStartTime.current
      return renderDuration
    },
  }
}

// Hook for monitoring React 18 concurrent features
export const useConcurrentFeatures = () => {
  useEffect(() => {
    // Monitor React 18 concurrent features usage
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('react')) {
            console.log(`[React 18] ${entry.name}: ${entry.duration.toFixed(2)}ms`)
          }
        })
      })

      observer.observe({ entryTypes: ['measure', 'navigation'] })

      return () => observer.disconnect()
    }
  }, [])
}

export default usePerformanceMonitoring
