// **  Initial State
const initialState = []

const dropdownDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_DROPDOWN_DATA':
      return action.data

    default:
      return state
  }
}

export default dropdownDataReducer
