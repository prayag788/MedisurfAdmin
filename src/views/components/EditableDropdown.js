import { useState, useEffect } from 'react'
import { selectThemeColors } from '@utils'
import Select from 'react-select'
import { FormGroup, Label } from 'reactstrap'
import axios from 'axios'

export default function EditableDropdown({ setValue, register, fieldName, errors, clinics }) {
  const [selectedClinic, setSelectedClinic] = useState(clinics?.length ? clinics : null)
  const [dropdownData, setDropdownData] = useState([])
  const [loading, setLoading] = useState(false)
  const fetchData = inputValue => {
    setLoading(true)
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/institution-clinics/dropdownData?clinicName=${inputValue}`
      )
      .then(doc => {
        setDropdownData(doc.data.dropdownData)
      })
      .catch(err => {
        let textMessage
        if (err.response.data) {
          textMessage = err.response.data
        } else {
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const checkSelectedCinic = value => {
    setSelectedClinic(value)
  }

  useEffect(() => {
    if (selectedClinic) {
      setValue('clinics', selectedClinic)
    }
  }, [selectedClinic])

  useEffect(() => {
    fetchData('')
  }, [])

  return (
    <FormGroup className="w-100">
      <Label for="clinics">Clinics:</Label>
      <Select
        name="clinics"
        id="clinics"
        styles={{
          multiValueLabel: styles => ({
            ...styles,
            color: 'white',
          }),
          multiValueRemove: (styles, { data }) => ({
            ...styles,
            color: 'white',
          }),
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: errors?.[fieldName] ? 'red' : '#d8d6de',
          }),
        }}
        {...register(`${fieldName}`)}
        value={selectedClinic}
        loading={loading}
        onChange={checkSelectedCinic}
        isSearchable
        theme={selectThemeColors}
        getOptionValue={option => `${option['_id']}`}
        getOptionLabel={option => {
          return `${option['clinicName']}`
        }}
        options={dropdownData}
        isMulti
        onInputChange={e => {
          fetchData(e)
        }}
      />

      {errors && errors?.[fieldName] && (
        <label
          className="error"
          style={{ color: 'red', fontSize: '12px', fontWeight: '200' }}
        >{`${errors?.[fieldName]?.message ?? ''}`}</label>
      )}
    </FormGroup>
  )
}
