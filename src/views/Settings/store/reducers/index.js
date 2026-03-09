// ** Initial State
const initialState = {
  list: {},
  editable: {},
}
const ModalityReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_MODALITY':
      return {
        ...state,
        list: action.payload ? action.payload : {},
      }
    case 'ADD_MODALITY':
      return {
        ...state,
        list: state.list.concat([action.payload]),
      }
    case 'EDIT_MODALITY':
      return {
        ...state,
        editable: action.payload,
      }
    default:
      return state
  }
}

export default ModalityReducer
