import React from 'react'
import { AlertTriangle, RefreshCw } from 'react-feather'
import { Button, Card, CardBody, CardHeader, CardTitle } from 'reactstrap'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh', backgroundColor: '#f8f9fa' }}
        >
          <Card style={{ width: '500px', maxWidth: '90vw' }}>
            <CardHeader className="text-center">
              <AlertTriangle size={48} className="text-danger mb-2" />
              <CardTitle tag="h4" className="text-danger">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-muted mb-3">
                We're sorry, but something unexpected happened. Please try
                refreshing the page or contact support if the problem persists.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-3">
                  <h6>Error Details (Development Only):</h6>
                  <pre
                    className="bg-light p-2 rounded"
                    style={{
                      fontSize: '12px',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="d-flex justify-content-center gap-2">
                <Button
                  color="primary"
                  onClick={this.handleRetry}
                  className="d-flex align-items-center"
                >
                  <RefreshCw size={16} className="me-1" />
                  Try Again
                </Button>
                <Button
                  color="secondary"
                  outline
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
