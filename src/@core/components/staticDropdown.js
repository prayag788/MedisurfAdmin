import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import classnames from 'classnames'
import { selectThemeColors } from '@utils'
import { FormGroup, Label } from 'reactstrap'

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

// True when a is a subset of b (by option values) - used to detect stale prop after user removed an item
function isSubsetOf(a, b) {
  const setB = new Set(getSelectedIds(b))
  return getSelectedIds(a).every(id => setB.has(id))
}

const StaticDropdown = ({
  className,
  fieldName,
  labelName,
  options,
  isMulti,
  errors,
  required,
  setValue,
  value,
  isSearchable,
  control,
  name,
}) => {
  const [selectedValue, setSelectedValue] = useState()

  useEffect(() => {
    if (isMulti && value && Array.isArray(value)) {
      const formattedValues = value
        .map(item => {
          const norm = (v) => (v == null ? '' : String(v))
          if (typeof item === 'string') {
            const idStr = norm(item)
            const foundOption = options.find(opt => norm(opt.value) === idStr || norm(opt._id) === idStr)
            return foundOption || { value: item, _id: item, label: item, clinicName: item }
          }
          if (item && (item._id || item.value)) {
            const id = item._id || item.value
            const idStr = norm(id)
            const foundOption = options.find(opt => norm(opt.value) === idStr || norm(opt._id) === idStr)
            if (foundOption) {
              return foundOption
            }
            // Build display label for any field type (clinic, physician, user, modality, studyStatus)
            const displayLabel =
              item.clinicName ||
              item.clinic_name ||
              item.label ||
              item.name ||
              item.username ||
              item.physicianname ||
              (typeof item.value === 'string' ? item.value : null) ||
              item._id ||
              id ||
              'Unknown'
            return {
              value: id,
              _id: id,
              label: displayLabel,
              clinicName: displayLabel,
              clinic_name: displayLabel,
              name: displayLabel,
              username: item.username ?? displayLabel,
              physicianname: item.physicianname ?? displayLabel,
            }
          }
          return item
        })
        .filter(Boolean)
      // Modality "SELECT ALL": expand to all options (exclude selectAll placeholder)
      const hasSelectAll = fieldName === 'modality' && formattedValues.some(
        x => (x?.value ?? x?._id) === 'selectAll'
      )
      const resolvedValues = hasSelectAll
        ? options.filter(opt => opt.value !== 'selectAll')
        : formattedValues

      // Don't overwrite when prop looks stale:
      // - User removed an item: selectedValue has fewer items and is subset of prop
      // - User chose "Select all": selectedValue has more items and prop is subset (form not updated yet)
      const same = selectedIdsEqual(resolvedValues, selectedValue)
      const propLooksStaleRemove = Array.isArray(selectedValue) && selectedValue.length > 0 &&
        formattedValues.length > selectedValue.length && isSubsetOf(selectedValue, formattedValues)
      const propLooksStaleSelectAll = Array.isArray(selectedValue) && selectedValue.length > 0 &&
        resolvedValues.length < selectedValue.length && isSubsetOf(resolvedValues, selectedValue)
      const propLooksStale = propLooksStaleRemove || propLooksStaleSelectAll
      if (!same && !propLooksStale) {
        setSelectedValue(resolvedValues)
      }
    } else if (!isMulti && value) {
      if (typeof value === 'string') {
        const valStr = String(value)
        const foundOption = options.find(opt => String(opt.value) === valStr || String(opt._id) === valStr)
        setSelectedValue(foundOption || { value, _id: value, label: value })
      } else {
        setSelectedValue(value)
      }
    } else if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      if (isMulti && (!selectedValue || selectedValue.length === 0)) return
      setSelectedValue(isMulti ? [] : null)
    }
  }, [value, options, isMulti, selectedValue, fieldName])

  const invalid = {
    control: (provided, state) => ({
      ...provided,
      borderColor: 'red',
      '&:hover': {
        borderColor: 'red',
      },
      cursor: 'pointer',
      minHeight: fieldName === 'modality' ? 42 : undefined,
    }),
    multiValue: (provided) => ({
      ...provided,
      borderRadius: 4,
      padding: fieldName === 'modality' ? '2px 4px' : undefined,
    }),
    multiValueRemove: (provided, state) => ({
      ...provided,
      cursor: 'pointer',
      paddingLeft: 6,
      paddingRight: 6,
      ':hover': {
        backgroundColor: state.isFocused ? '#de350b' : '#ffbdad',
        color: '#fff',
      },
    }),
  }

  const regular = {
    control: (provided, state) => ({
      ...provided,
      borderColor: '#d8d6de',
      minHeight: fieldName === 'modality' ? 42 : undefined,
    }),
    multiValue: (provided) => ({
      ...provided,
      borderRadius: 4,
      padding: fieldName === 'modality' ? '2px 4px' : undefined,
    }),
    multiValueRemove: (provided, state) => ({
      ...provided,
      cursor: 'pointer',
      paddingLeft: 6,
      paddingRight: 6,
      borderRadius: '0 4px 4px 0',
      ':hover': {
        backgroundColor: state.isFocused ? '#de350b' : '#ffbdad',
        color: '#fff',
      },
    }),
  }

  useEffect(() => {
    if (selectedValue !== undefined) {
      setValue(`${fieldName}`, selectedValue)
    }
  }, [selectedValue, setValue, fieldName])

  // Update form in same tick as user change (like modality) so remove/add works for all fields (Users, clinicNames, etc.)
  const checkSelectedValue = (newValue) => {
    const next = newValue || []
    if (fieldName === 'modality') {
      const selectAllOption = next.find(data => (data?.value ?? data?._id) === 'selectAll')
      if (selectAllOption) {
        const allModalities = options.filter(opt => opt.value !== 'selectAll')
        setSelectedValue(allModalities)
        setValue(fieldName, allModalities)
      } else {
        setSelectedValue(next)
        setValue(fieldName, next)
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
        <Label for={fieldName} className="mb-0">
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
      <Select
        name={fieldName}
        value={selectedValue}
        onChange={checkSelectedValue}
        getOptionValue={option => `${option['value'] || option['_id']}`}
        getOptionLabel={option => {
          if (!option) return 'Unknown'
          // Handle different data structures for clinic names and other entities
          return (
            option.clinicName ||
            option.clinic_name ||
            option.label ||
            option.name ||
            option.username ||
            option.physicianname ||
            option._id ||
            option.value ||
            'Unknown'
          )
        }}
        styles={!errors?.[fieldName] ? regular : invalid}
        classNamePrefix="select"
        options={options}
        isSearchable={isSearchable !== false}
        isClearable={isMulti}
        theme={selectThemeColors}
        isMulti={isMulti}
        className={classnames({
          'is-invalid': errors?.[fieldName],
          'react-select': true,
          staticmodality: true,
        })}
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

export default React.memo(StaticDropdown)
