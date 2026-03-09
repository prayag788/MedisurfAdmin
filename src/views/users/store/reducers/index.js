// ** Initial State

const DoctorListReducer = (state = [], action) => {
  switch (action.type) {
    case 'FETCH_DOCTORS_EVENT':
      return action.payload
    case 'ADD_DOCTOR_EVENT':
      return state.concat(action.payload)
    case 'UPDATE_DOCTOR_EVENT':
      return state.map(obj => (obj.id === action.payload.id ? action.payload : obj))
    case 'DELETE_DOCTOR_EVENT':
      return state.filter(obj => obj.id !== action.payload)
    case 'UPDATE_FILTERS':
      // ** Updates Filters based on action filter
      const filterIndex = state.selectedCalendars.findIndex(i => i === action.filter)
      if (state.selectedCalendars.includes(action.filter)) {
        state.selectedCalendars.splice(filterIndex, 1)
      } else {
        state.selectedCalendars.push(action.filter)
      }
      if (state.selectedCalendars.length === 0) {
        state.events.length = 0
      }
      return { ...state }
    case 'UPDATE_ALL_FILTERS':
      // ** Updates All Filters based on action value
      const value = action.value
      let selected = []
      if (value === true) {
        selected = ['Personal', 'Business', 'Family', 'Holiday', 'ETC']
      } else {
        selected = []
      }
      return { ...state, selectedCalendars: selected }
    case 'SELECT_EVENT':
      return { ...state, selectedEvent: action.event }
    default:
      return state
  }
}

export default DoctorListReducer
