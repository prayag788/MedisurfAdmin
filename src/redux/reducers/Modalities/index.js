// **  Initial State
const initialState = []

const ModalityReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_MODALITIES':
      return action.data

    default:
      return state
  }
}

export default ModalityReducer
