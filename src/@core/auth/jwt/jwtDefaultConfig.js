// ** Auth Endpoints
export default {
  loginEndpoint: '/jwt/login',
  registerEndpoint: '/jwt/register',
  refreshEndpoint: '/jwt/refresh-token',
  logoutEndpoint: '/jwt/logout',

  // ** This will be prefixed in authorization header with token

  tokenType: 'Bearer',

  // ** Value of this property will be used as key to store JWT token in storage
  storageTokenKeyName: 'accessToken',
  storageActivationKeyName: 'activationKey',
  storageRefreshTokenKeyName: 'refreshToken',
}
