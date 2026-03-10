/**
 * Utility functions for handling clinic data normalization
 * This ensures consistent clinic name display across all components
 */

/**
 * Normalizes clinic data to ensure consistent field names
 * @param {Object|Array} clinicData - Single clinic object or array of clinic objects
 * @returns {Object|Array} Normalized clinic data with consistent field names
 */
export const normalizeClinicData = (clinicData) => {
  if (!clinicData) return null

  if (Array.isArray(clinicData)) {
    return clinicData.map((clinic) => normalizeClinicData(clinic))
  }

  if (typeof clinicData === 'string') {
    return {
      _id: clinicData,
      value: clinicData,
      clinicName: `Clinic ${clinicData}`,
      label: `Clinic ${clinicData}`,
      name: `Clinic ${clinicData}`,
    }
  }

  const clinicName =
    clinicData.clinicName ||
    clinicData.clinic_name ||
    clinicData.name ||
    clinicData.label ||
    `Clinic ${clinicData._id || clinicData.value || 'Unknown'}`

  return {
    _id: clinicData._id || clinicData.value || clinicData.id,
    value: clinicData._id || clinicData.value || clinicData.id,
    clinicName,
    clinic_name: clinicName,
    name: clinicName,
    label: clinicName,
  }
}

/**
 * Normalizes dropdown options for clinic selection
 * @param {Array} options - Array of clinic options from API
 * @returns {Array} Normalized options with consistent field names
 */
export const normalizeClinicOptions = (options) => {
  if (!Array.isArray(options)) return []

  return options.map((option) => {
    const clinicName =
      option.clinicName ||
      option.clinic_name ||
      option.name ||
      option.label ||
      `Clinic ${option._id || option.value || 'Unknown'}`

    return {
      value: option._id || option.value,
      _id: option._id || option.value,
      clinicName,
      clinic_name: clinicName,
      name: clinicName,
      label: clinicName,
    }
  })
}

/**
 * Gets the display name for a clinic from various possible field names
 * @param {Object} clinic - Clinic object
 * @returns {string} Display name for the clinic
 */
export const getClinicDisplayName = (clinic) => {
  if (!clinic) return 'Unknown Clinic'

  if (typeof clinic === 'string') {
    return `Clinic ${clinic}`
  }

  return (
    clinic.clinicName ||
    clinic.clinic_name ||
    clinic.name ||
    clinic.label ||
    `Clinic ${clinic._id || clinic.value || 'Unknown'}`
  )
}

/**
 * Normalizes form data containing clinic information
 * @param {Object} formData - Form data object
 * @param {string} clinicFieldName - Name of the field containing clinic data (default: 'clinics')
 * @returns {Object} Form data with normalized clinic information
 */
export const normalizeFormClinicData = (
  formData,
  clinicFieldName = 'clinics'
) => {
  if (!formData || !formData[clinicFieldName]) return formData

  return {
    ...formData,
    [clinicFieldName]: normalizeClinicData(formData[clinicFieldName]),
  }
}
