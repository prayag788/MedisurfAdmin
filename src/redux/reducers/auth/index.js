// **  Initial State
const initialState = {
  userData: (() => {
    try {
      const userDataString = localStorage?.getItem('userData')
      return userDataString ? JSON.parse(userDataString) : {}
    } catch {
      return {}
    }
  })(),
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        userData: action.data,
        [action.config.storageTokenKeyName]:
          action[action.config.storageTokenKeyName],
        [action.config.storageRefreshTokenKeyName]:
          action[action.config.storageRefreshTokenKeyName],
      }
    case 'LOGOUT':
      const obj = { ...action }
      delete obj.type
      return { ...state, userData: {}, ...obj }
    case 'UPDATE_USERDATA':
      console.log('UPDATE_USERDATA', action)
      return {
        ...state,
        userData: { ...state.userData, ...action.data },
      }
    default:
      return state
  }
}

export default authReducer
