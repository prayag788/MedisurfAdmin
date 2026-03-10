import axios from 'axios'
import {
  showConfirm,
  showSuccessAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../../../utils/alerts'

export const handleConfirm = (id, callback, msg, btnMsg) => {
  return showConfirm({ text: msg, confirmButtonText: btnMsg }).then(
    (result) => {
      if (result && result.isConfirmed) {
        callback(id)
      }
    }
  )
}

export function deleteUser(id) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/clinic/delete/${id}`)
      .then(() => {
        showSuccessAlert('Clinic Deleted Successfully!', '<p>Deleted!</p>')
        resolve(true)
      })
      .catch((err) => {
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
        reject(false)
      })
  })
}
