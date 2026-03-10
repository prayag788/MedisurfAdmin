// ** Initial State

const userDetails = JSON.parse(localStorage.getItem('userData'))
const initialState = {
  suggestions: [],
  bookmarks: [],
  query: '',
  avatar:
    JSON.parse(localStorage.getItem('userData'))?.avatar ||
    '/static/media/avatar-s-11.1d46cc62.jpg',
}

const navbarReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'HANDLE_SEARCH_QUERY':
      return { ...state, query: action.val }
    case 'GET_BOOKMARKS':
      return { ...state, suggestions: action.data, bookmarks: action.bookmarks }
    case 'HANDLE_USER_AVATAR':
      return { ...state, avatar: action.value }
    case 'UPDATE_BOOKMARKED':
      let objectToUpdate

      // ** find & update object
      state.suggestions.find((item) => {
        if (item.id === action.id) {
          item.isBookmarked = !item.isBookmarked
          objectToUpdate = item
        }
      })

      // ** Get index to add or remove bookmark from array
      const bookmarkIndex = state.bookmarks.findIndex((x) => x.id === action.id)

      if (bookmarkIndex === -1) {
        state.bookmarks.push(objectToUpdate)
      } else {
        state.bookmarks.splice(bookmarkIndex, 1)
      }

      return { ...state }
    default:
      return state
  }
}

export default navbarReducer
