// ** Redux Imports
import { combineReducers } from 'redux'

// ** Reducers Imports
import auth from './auth'
import navbar from './navbar'
import layout from './layout'
import DoctorList from '@src/views/doctors/store/reducers'
import Modality from '@src/views/Settings/store/reducers'
import ModalityReducer from './Modalities'
import License from './license'
import dropdownDataReducer from './dropDownData'

const rootReducer = combineReducers({
  auth,
  navbar,
  layout,
  DoctorList,
  Modality,
  ModalityReducer,
  dropdownDataReducer,
  License,
})

export default rootReducer
