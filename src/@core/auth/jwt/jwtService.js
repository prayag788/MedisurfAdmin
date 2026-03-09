import axios from 'axios'
import jwtDefaultConfig from './jwtDefaultConfig'

export default class JwtService {
  // ** jwtConfig <= Will be used by this service
  jwtConfig = { ...jwtDefaultConfig }

  // ** For Refreshing Token
  isAlreadyFetchingAccessToken = false

  // ** For Refreshing Token
  subscribers = []

  constructor(jwtOverrideConfig) {
    this.jwtConfig = { ...this.jwtConfig, ...jwtOverrideConfig }
  }

  onAccessTokenFetched(accessToken) {
    this.subscribers = this.subscribers.filter(callback => {
      return callback(accessToken)
    })
  }

  addSubscriber(callback) {
    this.subscribers.push(callback)
  }

  getToken() {
    let accessToken
    if (sessionStorage.getItem('sharedStudy') === 'true') {
      accessToken = localStorage.getItem('sharedaccessToken')
    } else {
      accessToken = localStorage.getItem(this.jwtConfig.storageTokenKeyName)
    }
    if (!accessToken) {
      accessToken = localStorage.getItem('sharedaccessToken')
    }
    return accessToken
  }

  getRefreshToken() {
    return localStorage.getItem(this.jwtConfig.storageRefreshTokenKeyName)
  }

  setToken(value) {
    localStorage.setItem(this.jwtConfig.storageTokenKeyName, value)
  }

  setRefreshToken(value) {
    localStorage.setItem(this.jwtConfig.storageRefreshTokenKeyName, value)
  }

  login(...args) {
    return axios.post(this.jwtConfig.loginEndpoint, ...args)
  }

  register(...args) {
    return axios.post(this.jwtConfig.registerEndpoint, ...args)
  }

  refreshToken() {
    return axios.post(this.jwtConfig.refreshEndpoint, {
      refreshToken: this.getRefreshToken(),
    })
  }
}
