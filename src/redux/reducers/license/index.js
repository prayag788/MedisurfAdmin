// **  Initial State
const initialState = {}

const License = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_LICENSE':
      return action.data

    default:
      return state
  }
}

export default License
