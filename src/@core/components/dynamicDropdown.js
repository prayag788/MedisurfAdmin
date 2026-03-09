import axios from 'axios'
import classNames from 'classnames'
import React, { useState, useEffect } from 'react'
import { FormGroup, Label } from 'reactstrap'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import { selectThemeColors } from '@utils'

function getSelectedIds(arr) {
  if (!Array.isArray(arr)) return []
  return arr
    .map(x => x?.value ?? x?._id ?? x)
    .filter(Boolean)
    .map(id => (typeof id === 'string' ? id : String(id)))
    .sort()
}

function selectedIdsEqual(a, b) {
  const idsA = getSelectedIds(a).join(',')
  const idsB = getSelectedIds(b).join(',')
  return idsA === idsB
}

function isSubsetOf(a, b) {
  const setB = new Set(getSelectedIds(b))
  return getSelectedIds(a).every(id => setB.has(id))
}

const DynamicDropdown = ({
  className,
  setValue,
  labelName,
  isMulti,
  fieldName,
  errors,
  value,
  roleName,
  required,
  openNestedModal,
  alreadyValue,
  filterfor,
  control,
  name,
  institutionalOnly,
}) => {
  const controlledValue = value ?? alreadyValue
  const invalid = {
    control: (provided, state) => ({
      ...provided,
      borderColor: 'red',
      '&:hover': {
        borderColor: 'red',
      },
      cursor: 'pointer',
    }),
  }
  const regular = {
    control: (provided, state) => ({
      ...provided,
      borderColor: '#d8d6de',
    }),
  }
  const [selectedValue, setSelectedValue] = useState(controlledValue)
  const [key, setKey] = useState('')
  const [dropdownData, setDropdownData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isMulti && controlledValue && Array.isArray(controlledValue)) {
      const formatted = controlledValue
        .map(item => {
          if (item == null) return null
          if (typeof item === 'string') {
            return { value: item, _id: item, label: item }
          }
          const id = item._id ?? item.value
          if (!id) return item
          return {
            ...item,
            value: id,
            _id: id,
            label:
              item.label ||
              item.clinicName ||
              item.clinic_name ||
              item.name ||
              item.username ||
              item.physicianname ||
              id,
          }
        })
        .filter(Boolean)
      const same = selectedIdsEqual(formatted, selectedValue)
      const propLooksStaleRemove =
        Array.isArray(selectedValue) &&
        selectedValue.length > 0 &&
        formatted.length > selectedValue.length &&
        isSubsetOf(selectedValue, formatted)
      const propLooksStaleSelectAll =
        Array.isArray(selectedValue) &&
        selectedValue.length > 0 &&
        formatted.length < selectedValue.length &&
        isSubsetOf(formatted, selectedValue)
      if (!same && !propLooksStaleRemove && !propLooksStaleSelectAll) {
        setSelectedValue(formatted)
      }
    } else if (!isMulti && controlledValue) {
      const val = controlledValue
      setSelectedValue(
        typeof val === 'string'
          ? { value: val, _id: val, label: val }
          : val
      )
    } else if (
      controlledValue === undefined ||
      controlledValue === null ||
      (Array.isArray(controlledValue) && controlledValue.length === 0)
    ) {
      if (isMulti && (!selectedValue || selectedValue.length === 0)) return
      setSelectedValue(isMulti ? [] : null)
    }
  }, [controlledValue, isMulti, selectedValue])

  const fetchData = inputValue => {
    setLoading(true)
    axios
      .get(`${process.env.REACT_APP_API_URL}/dropdownData/${roleName}?name=${inputValue}${institutionalOnly ? '&institutionalOnly=true' : ''}`)
      .then(doc => {
        setDropdownData(doc.data.dropdownData)
      })
      .catch(err => {
        // Only handle response errors, let global interceptor handle network errors
        if (err && err.response) {
          console.error('API Error:', err.response.data)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (selectedValue) {
      setValue(`${fieldName}`, selectedValue)
    }
  }, [selectedValue])
  const loadOptions = async (searchQuery, loadedOptions, { page }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/dropdownData/${roleName}?name=${searchQuery}&page=${page}&size=10&filterfor=${filterfor}${institutionalOnly ? '&institutionalOnly=true' : ''}`
      )

      const responseJSON = response.data.dropdownData
      const hasMore = responseJSON.length >= 1

      if (page === 1) {
        if (roleName === 'PhysicianAll') {
        } else if (filterfor !== 'Physician') {
          responseJSON.unshift({
            name: 'SELECT ALL',
            clinicName: 'select all',
            username: 'select all',
            _id: 'selectAll',
            value: 'selectAll',
          })
        }
        if (fieldName === 'Users') {
          responseJSON.unshift({ name: 'Add new user', value: 'addNewUser' })
        }
      }
      return {
        options: responseJSON,
        hasMore,
        additional: {
          page: searchQuery ? 2 : page + 1,
        },
      }
    } catch (err) {
      // Only handle response errors, let global interceptor handle network errors
      if (err && err.response) {
        console.error('Failed to load dropdown options:', err.response.data?.message || err.message)
      }
      // Return empty options for network errors to prevent UI issues
      return {
        options: [],
        hasMore: false,
        additional: {
          page: searchQuery ? 2 : page + 1,
        },
      }
    }
  }

  const onChange = option => {
    if (option?._id && !Array.isArray(option)) {
      if (option._id === 'select') {
        option._id = null
      }
      setSelectedValue(option)
      setValue(fieldName, option)
      return
    }
    if (option?.find(data => data.value === 'addNewUser')) {
      setKey(Math.random())
      if (openNestedModal) {
        openNestedModal()
      }
      return
    }
    const next = option || []
    const findSelectAll = next.find(data => (data?.value ?? data?._id) === 'selectAll')
    if (findSelectAll) {
      if (fieldName === 'Users') {
        setLoading(true)
        axios
          .get(`${process.env.REACT_APP_API_URL}/filter-module/get-clinic-users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          })
          .then(res => {
            const allUsers = res.data.data?.map(user => ({
              value: user._id,
              label: user.username,
              _id: user._id,
              name: user.name,
              username: user.username,
              fname: user.fname,
              lname: user.lname
            })) || []
            setSelectedValue(allUsers)
            setValue(fieldName, allUsers)
          })
          .catch(err => {
            console.error('API Error:', err)
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        setSelectedValue([findSelectAll])
        setValue(fieldName, [findSelectAll])
      }
    } else {
      setSelectedValue(next)
      setValue(fieldName, next)
    }
  }

  const handleClearAll = () => {
    setSelectedValue([])
    setValue(fieldName, [])
  }

  return (
    <FormGroup className={className}>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-50">
        <Label for={`${fieldName}`} className="mb-0">
          {labelName}: {required && <span style={{ color: '#FF0000' }}>*</span>}
        </Label>
        {isMulti && selectedValue && selectedValue.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-flat-secondary"
            onClick={handleClearAll}
            style={{ fontSize: '12px', padding: '2px 8px' }}
          >
            Clear all
          </button>
        )}
      </div>
      {}
      <AsyncPaginate
        key={`${key}${filterfor}`}
        name={`${fieldName}`}
        id={`${fieldName}`}
        value={selectedValue}
        loadOptions={loadOptions}
        getOptionValue={option => `${option['_id']}`}
        getOptionLabel={option => {
          if (option.value === 'addNewUser' || option.value === 'selectAll') {
            return option.name
          }
          // Handle different field names based on role type
          if (roleName === 'CU' || roleName === 'ClinicUser') {
            // For clinic users, use fname and lname
            const fullName = `${option.fname || ''} ${option.lname || ''}`.trim()
            return fullName || option.username || option._id || 'Unknown User'
          }
          // For other roles (clinics, physicians, etc.)
          const displayName =
            option.clinicName ||
            option.clinic_name ||
            option.physicianname ||
            option.name ||
            option.label ||
            option.username ||
            option._id ||
            'Unknown'
          return displayName
        }}
        onChange={onChange}
        isSearchable={true}
        isMulti={isMulti}
        classNamePrefix="select"
        className={classNames({
          'is-invalid': errors?.[fieldName],
          'react-select': true,
          staticmodality: true,
        })}
        styles={!errors?.[fieldName] ? regular : invalid}
        placeholder="Select "
        theme={selectThemeColors}
        additional={{
          page: 1,
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
DynamicDropdown.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
}
export default React.memo(DynamicDropdown)
