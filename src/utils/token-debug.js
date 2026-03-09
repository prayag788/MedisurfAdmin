// Debug utility to check token storage
export const debugTokenStorage = () => {
  console.log('=== TOKEN DEBUG ===')

  const accessToken = localStorage.getItem('accessToken')
  const authToken = localStorage.getItem('authToken')
  const userData = localStorage.getItem('userData')

  console.log('Raw accessToken:', accessToken)
  console.log('Raw authToken:', authToken)
  console.log('Raw userData:', userData)

  if (accessToken) {
    try {
      const parsed = JSON.parse(accessToken)
      console.log('Parsed accessToken:', parsed)
    } catch (e) {
      console.log('accessToken is plain string:', accessToken)
    }
  }

  if (userData) {
    try {
      const parsed = JSON.parse(userData)
      console.log('Parsed userData:', parsed)
    } catch (e) {
      console.log('userData parse error:', e.message)
    }
  }

  console.log('=== END DEBUG ===')
}

// Clear all auth tokens
export const clearAuthTokens = () => {
  // localStorage.removeItem('accessToken')
  // localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userData')
  console.log('All auth tokens cleared')
}
