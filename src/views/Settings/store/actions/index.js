import axios from 'axios'

// ** Fetch Events - use explorer/modalities for DICOM config (AET, Host, Port)
export const fetchEvent = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}/explorer/modalities`)
      .then((response) => {
        const modalitiesData = response.data || {}
        dispatch({
          type: 'FETCH_MODALITY',
          payload: modalitiesData,
        })
      })
      .catch((err) => {
        if (err?.response) {
          console.error(
            'Failed to fetch modalities:',
            err.response.data?.message || err.message
          )
        }
        dispatch({
          type: 'FETCH_MODALITY',
          payload: {},
        })
      })
  }
}

// ** Add Event
export const addEvent = (payload) => {
  return {
    type: 'ADD_MODALITY',
    payload,
  }
}

// ** Edit Event
export const editEvent = (payload) => {
  return {
    type: 'EDIT_MODALITY',
    payload,
  }
}

// ** Update Event
export const updateEvent = (payload) => {
  return {
    type: 'UPDATE_MODALITY',
    payload,
  }
}

// ** Filter Events
export const deleteEvent = (payload) => {
  return {
    type: 'DELETE_DOCTOR_EVENT',
    payload,
  }
}

// ** Add/Remove All Filters
export const updateAllFilters = (value) => {
  return (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_ALL_FILTERS',
      value,
    })
    dispatch(fetchEvents(getState().calendar.selectedCalendars))
  }
}

// ** remove Event
export const removeEvent = (id) => {
  return (dispatch) => {
    axios.delete('/apps/calendar/remove-event', { id }).then(() => {
      dispatch({
        type: 'REMOVE_EVENT',
      })
    })
  }
}

// ** Select Event (get event data on click)
export const selectEvent = (event) => {
  return (dispatch) => {
    dispatch({
      type: 'SELECT_EVENT',
      event,
    })
  }
}
