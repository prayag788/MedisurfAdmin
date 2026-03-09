import { Suspense, lazy } from 'react'
import { Spinner } from 'reactstrap'

// React 18 optimized lazy loading wrapper
const LazyWrapper = ({
  component,
  fallback = (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '200px' }}
    >
      <Spinner color="primary" />
    </div>
  ),
  errorBoundary = true,
  ...props
}) => {
  const LazyComponent = lazy(() => component)

  const ComponentWithErrorBoundary = ({ children }) => {
    if (errorBoundary && process.env.NODE_ENV === 'production') {
      // In production, wrap with error boundary
      const ErrorBoundary = lazy(() => import('./ErrorBoundary'))
      return (
        <Suspense fallback={fallback}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Suspense>
      )
    }
    return children
  }

  return (
    <ComponentWithErrorBoundary>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ComponentWithErrorBoundary>
  )
}

export default LazyWrapper
