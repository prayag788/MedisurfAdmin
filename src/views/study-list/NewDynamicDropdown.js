import axios from 'axios'
import classNames from 'classnames'
import { useState, useEffect, useCallback } from 'react'
import { FormGroup, Label } from 'reactstrap'
import { AsyncPaginate } from 'react-select-async-paginate'
import { selectThemeColors } from '@utils'
const NewDynamicDropdown = ({
  className,
  setValue,
  labelName,
  fieldName,
  value,
  roleName,
  alreadyValue,
  onChange,
}) => {
  const regular = {
    control: (provided, state) => ({
      ...provided,
      borderColor: '#d8d6de',
    }),
  }
  const [selectedValue, setSelectedValue] = useState(value)
  const [key, setKey] = useState('')
  const [dropdownData, setDropdownData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (alreadyValue) {
      setSelectedValue(alreadyValue)
    }
  }, [alreadyValue])
  const fetchData = inputValue => {
    setLoading(true)
    axios
      .get(`${process.env.REACT_APP_API_URL}/dropdownData/${roleName}?name=${inputValue}`)
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

  //   }
  useEffect(() => {
    if (selectedValue) {
    }
  }, [selectedValue])

  const loadOptions = useCallback(async (searchQuery, loadedOptions, { page }) => {
    try {
      if (roleName === 'modalities') {
        // Fetch all modalities dynamically from Orthanc (merged: series + configured + standard)
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/orthanc/modalities`
        )
        const raw = response?.data
        let arr = []
        if (Array.isArray(raw)) arr = raw
        else if (raw && typeof raw === 'object') {
          const names = new Set()
          Object.keys(raw).forEach((key) => {
            const config = raw[key]
            const aet = config && (config.AET ?? config.AeTitle ?? config.aeTitle)
            if (aet && typeof aet === 'string') names.add(String(aet).trim())
            else names.add(String(key).trim())
          })
          arr = Array.from(names).sort()
        }
        const options = arr
          .filter(Boolean)
          .map(m => (typeof m === 'string' ? m : (m?.Name ?? m?.name ?? m?.value ?? String(m))))
          .filter(Boolean)
          .map(name => ({ _id: name, name }))
        return {
          options,
          hasMore: false,
          additional: { page: 1 },
        }
      }

      const url = `${process.env.REACT_APP_API_URL}/dropdownData/${roleName}?name=${searchQuery}&page=${page}&size=10`
      const response = await axios.get(url)
      const responseJSON = response.data.dropdownData || []
      const hasMore = responseJSON.length >= 1

      return {
        options: responseJSON,
        hasMore,
        additional: {
          page: searchQuery ? 2 : page + 1,
        },
      }
    } catch (error) {
      console.error('Error loading dropdown options:', error)
      return {
        options: [],
        hasMore: false,
        additional: { page: 1 },
      }
    }
  }, [roleName])

  return (
    <FormGroup className={className}>
      <Label for={`${fieldName}`}>{labelName}</Label>
      {}
      <AsyncPaginate
        key={key}
        value={selectedValue}
        loadOptions={loadOptions}
        getOptionValue={option => `${option['_id']}`}
        getOptionLabel={option => {
          // Handle different field names for clinic names and other entities
          const displayName =
            option.physicianname ||
            option.clinicName ||
            option.clinic_name ||
            option.name ||
            (option.fname && option.lname ? `${option.fname} ${option.lname}`.trim() : '') ||
            option.fname ||
            option.username ||
            option.label ||
            'Unknown'
          return displayName !== '-' && displayName !== '-.' && displayName !== '-1' ? displayName : 'Unknown'
        }}
        onChange={onChange}
        isSearchable={true}
        isMulti={true}
        classNamePrefix="select"
        className={classNames({ 'react-select': true, staticmodality: true })}
        styles={regular}
        placeholder="Select "
        theme={selectThemeColors}
        additional={{
          page: 1,
        }}
      />
    </FormGroup>
  )
}

export default NewDynamicDropdown
