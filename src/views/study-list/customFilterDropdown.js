import { useCallback, useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { selectThemeColors } from '@utils'
import { FormGroup, Label } from 'reactstrap'
import axios from 'axios'
import Select from 'react-select'

// Per-session cache keyed by pathname so we don't show another user's filters after login switch
let cachedFilterOptions = null
let cachedPathname = null

const CustomFilterDropdown = ({
  addNewFilter,
  selectedDropDownFilter,
  setSelectedDropDownFilter,
}) => {
  const location = useLocation()
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const wasModalOpen = useRef(false)

  const loadFilters = useCallback(async () => {
    try {
      setLoading(true)
      const token =
        localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      const apiUrl = process.env.REACT_APP_API_URL || ''
      const url = `${apiUrl.replace(/\/$/, '')}/filter-module/get-dropdown-data`

      const response = await axios({
        method: 'GET',
        url,
        params: { name: '', page: 1, size: 50 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000,
      })

      if (response.data?.success && response.data?.list) {
        cachedFilterOptions = response.data.list
        cachedPathname = location.pathname
        setOptions(response.data.list)
      } else {
        setOptions([])
      }
    } catch (error) {
      console.error('Filter load error:', error.message)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [location.pathname])

  // On mount and pathname change: clear cache and fetch so list is always restrictive for current user
  useEffect(() => {
    cachedFilterOptions = null
    cachedPathname = null
    loadFilters()
  }, [location.pathname, loadFilters])

  // Reload options after the Add Filter modal closes (potential new filters)
  useEffect(() => {
    if (wasModalOpen.current && !addNewFilter) {
      cachedFilterOptions = null
      loadFilters()
    }
    wasModalOpen.current = addNewFilter
  }, [addNewFilter, loadFilters])

  const handleChange = (selectedOption) => {
    setSelectedDropDownFilter(selectedOption || null)
  }

  return (
    <FormGroup
      style={{ width: '100%', minWidth: '140px', marginRight: 'auto' }}
    >
      <Label for={'filterdropdown'}>Filter:</Label>
      <Select
        key={addNewFilter}
        value={selectedDropDownFilter}
        options={options}
        getOptionValue={(option) => option._id}
        getOptionLabel={(option) => {
          const filterName = option.name || 'Unnamed Filter'
          const criteria = []

          if (option.Users?.length > 0) {
            criteria.push(`Users: ${option.Users.length}`)
          }
          if (option.Physicians?.length > 0) {
            criteria.push(`Physicians: ${option.Physicians.length}`)
          }
          if (option.clinicNames?.length > 0) {
            criteria.push(`Clinics: ${option.clinicNames.length}`)
          }
          if (option.studyStatus?.length > 0) {
            criteria.push(`Status: ${option.studyStatus.length}`)
          }
          if (option.modality?.length > 0) {
            criteria.push(`Modality: ${option.modality.length}`)
          }

          return criteria.length > 0
            ? `${filterName} (${criteria.join(' | ')})`
            : filterName
        }}
        onChange={handleChange}
        isSearchable
        isClearable
        isLoading={loading}
        classNamePrefix="select"
        placeholder="Select filter"
        theme={selectThemeColors}
      />
    </FormGroup>
  )
}

export default CustomFilterDropdown
