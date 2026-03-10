import axios from 'axios'

// Global axios interceptor for live updates
const setupLiveUpdateInterceptor = () => {
  // Request interceptor to add cache busting
  axios.interceptors.request.use(
    (config) => {
      // Add cache busting for user-related requests
      if (config.url && config.url.includes('/user')) {
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        config.headers['Pragma'] = 'no-cache'
        config.headers['Expires'] = '0'
        // Add timestamp to prevent caching
        const separator = config.url.includes('?') ? '&' : '?'
        config.url += `${separator}_t=${Date.now()}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor to handle refresh flags
  axios.interceptors.response.use(
    (response) => {
      // Check for refresh headers or flags
      const shouldRefresh =
        response.data?.refresh ||
        response.headers['x-refresh-required'] ||
        response.headers['x-fresh-data']

      if (shouldRefresh) {
        // Emit custom event for components to listen to
        window.dispatchEvent(
          new CustomEvent('userDataRefresh', {
            detail: {
              action: response.headers['x-action'] || response.data?.action,
              role: response.headers['x-role'] || response.data?.role,
              userId:
                response.headers['x-user-updated'] || response.data?.userId,
            },
          })
        )
      }

      return response
    },
    (error) => Promise.reject(error)
  )
}

export default setupLiveUpdateInterceptor
