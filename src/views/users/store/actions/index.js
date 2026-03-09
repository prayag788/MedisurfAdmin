import axios from 'axios'

// ** Fetch Events
export const fetchEvent = payload => {
  return {
    type: 'FETCH_DOCTORS_EVENT',
    payload: [
      {
        responsive_id: '',
        id: 1,
        full_name: 'Example One',
        email: 'example1@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 1,
      },
      {
        responsive_id: '',
        id: 2,
        full_name: 'Example Two',
        email: 'example2@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 1,
      },
      {
        responsive_id: '',
        id: 3,
        full_name: 'Example Three',
        email: 'example3@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 0,
      },
      {
        responsive_id: '',
        id: 4,
        full_name: 'Example Four',
        email: 'example4@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 1,
      },
      {
        responsive_id: '',
        id: 5,
        full_name: 'Example Five',
        email: 'example5@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 1,
      },
      {
        responsive_id: '',
        id: 6,
        full_name: 'Example Six',
        email: 'example6@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 0,
      },
      {
        responsive_id: '',
        id: 7,
        full_name: 'Example Seven',
        email: 'example7@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 1,
      },
      {
        responsive_id: '',
        id: 8,
        full_name: 'Example Eight',
        email: 'example8@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 1,
      },
      {
        responsive_id: '',
        id: 9,
        full_name: 'Example Nine',
        email: 'example9@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 0,
      },
      {
        responsive_id: '',
        id: 10,
        full_name: 'Example Ten',
        email: 'example10@example.com',
        hospital_name: 'BEC',
        designation: 'Doctor',
        CNO: '3054639447',
        status: 0,
      },
    ],
  }

  // })
}

// ** Add Event
export const addEvent = payload => {
  return {
    type: 'ADD_DOCTOR_EVENT',
    payload,
  }

  //     })

  //   })
  // }
}

// ** Update Event
export const updateEvent = payload => {
  return {
    type: 'UPDATE_DOCTOR_EVENT',
    payload,
  }

  //   })
  // })
}

// ** Filter Events
export const deleteEvent = payload => {
  return {
    type: 'DELETE_DOCTOR_EVENT',
    payload,
  }

  //   })

  // }
}

// ** Add/Remove All Filters
export const updateAllFilters = value => {
  return (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_ALL_FILTERS',
      value,
    })
    dispatch(fetchEvents(getState().calendar.selectedCalendars))
  }
}

// ** remove Event
export const removeEvent = id => {
  return dispatch => {
    axios.delete('/apps/calendar/remove-event', { id }).then(() => {
      dispatch({
        type: 'REMOVE_EVENT',
      })
    })
  }
}

// ** Select Event (get event data on click)
export const selectEvent = event => {
  return dispatch => {
    dispatch({
      type: 'SELECT_EVENT',
      event,
    })
  }
}
