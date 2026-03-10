// ** UseJWT import to get config
import useJwt from '@src/auth/jwt/useJwt'

const config = useJwt.jwtConfig

// ** Handle User Login
export const handleLogin = (data) => {
  return (dispatch) => {
    dispatch({
      type: 'LOGIN',
      data,
      config,
      [config.storageTokenKeyName]: data[config.storageTokenKeyName],
      [config.storageRefreshTokenKeyName]:
        data[config.storageRefreshTokenKeyName],
    })

    // ** Add to user, accessToken & refreshToken to localStorage
    localStorage.setItem('userData', JSON.stringify(data))
    document.cookie = `loginAuth=true; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/`
    localStorage.setItem(config.storageTokenKeyName, data.accessToken)
    localStorage.setItem(
      config.storageRefreshTokenKeyName,
      data.refreshToken || data.accessToken
    )

    // ** Set lastActivity to prevent immediate auto-logout
    const currentTime = require('moment')().unix()
    const logoutMinutes = data.logoutMinutes || 55555
    const newActivity = currentTime + logoutMinutes * 60
    localStorage.setItem('lastActivity', newActivity)
  }
}

// ** Handle User Logout
export const handleLogout = () => {
  return (dispatch) => {
    // ** Set auth to false in session
    localStorage.removeItem('lastActivity')
    localStorage.removeItem('userData')

    dispatch({
      type: 'LOGOUT',
      [config.storageTokenKeyName]: null,
      [config.storageRefreshTokenKeyName]: null,
    })

    // ** Remove user, accessToken & refreshToken from localStorage
    localStorage.removeItem(config.storageTokenKeyName)
    localStorage.removeItem(config.storageRefreshTokenKeyName)
    document.cookie = `loginAuth=; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
  }
  // }
}

export const handleuserDataUpdate = (value) => (dispatch) =>
  dispatch({ type: 'UPDATE_USERDATA', data: value })
