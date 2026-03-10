import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo, useCallback } from 'react'
import { FORM_DEFAULTS } from '../constants'

// ** Common Form Hooks
export const useFormWithValidation = (
  schema,
  defaultValues = {},
  options = {}
) => {
  const formOptions = {
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues,
    shouldUnregister: true,
    ...options,
  }

  return useForm(formOptions)
}

// ** Form Reset Utilities
export const createFormResetHandler = (reset, defaultValues) => {
  return useCallback(() => {
    reset(defaultValues)
  }, [reset, defaultValues])
}

// ** Form Submission Handler
export const createFormSubmitHandler = (
  submitFunction,
  reset,
  defaultValues
) => {
  return useCallback(
    async (data) => {
      try {
        await submitFunction(data)
        reset(defaultValues)
      } catch (error) {
        // Error handling is done in the API layer
        throw error
      }
    },
    [submitFunction, reset, defaultValues]
  )
}

// ** Form Field Utilities
export const formFieldUtils = {
  // Create field props for Controller
  createFieldProps: (name, control, rules = {}) => ({
    name,
    control,
    rules,
  }),

  // Create input props with validation
  createInputProps: (field, errors, placeholder = '') => ({
    ...field,
    placeholder,
    invalid: errors && true,
  }),

  // Create select props with options
  createSelectProps: (field, errors, options = []) => ({
    ...field,
    invalid: errors && true,
    children: options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    )),
  }),
}

// ** Form Validation Utilities
export const validationUtils = {
  // Check if form is valid
  isFormValid: (errors) => Object.keys(errors).length === 0,

  // Get first error message
  getFirstError: (errors) => {
    const firstError = Object.values(errors)[0]
    return firstError?.message || ''
  },

  // Get all error messages
  getAllErrors: (errors) => {
    return Object.entries(errors).map(([field, error]) => ({
      field,
      message: error.message,
    }))
  },

  // Check if field has error
  hasError: (errors, fieldName) => errors && errors[fieldName],
}

// ** Form State Utilities
export const formStateUtils = {
  // Create form state for modals
  createModalFormState: (isOpen, defaultValues) =>
    useMemo(
      () => ({
        isOpen,
        defaultValues,
      }),
      [isOpen, defaultValues]
    ),

  // Create form submission state
  createSubmissionState: () =>
    useMemo(
      () => ({
        isSubmitting: false,
        hasSubmitted: false,
        submitError: null,
      }),
      []
    ),
}

// ** Pre-configured Form Hooks for Common Use Cases
export const useUserForm = (
  defaultValues = FORM_DEFAULTS.USER,
  options = {}
) => {
  const { USER_BASIC_SCHEMA } = require('../validation/schemas')
  return useFormWithValidation(USER_BASIC_SCHEMA, defaultValues, options)
}

export const useClinicForm = (
  defaultValues = FORM_DEFAULTS.CLINIC,
  options = {}
) => {
  const { CLINIC_SCHEMA } = require('../validation/schemas')
  return useFormWithValidation(CLINIC_SCHEMA, defaultValues, options)
}

export const usePhysicianForm = (
  defaultValues = FORM_DEFAULTS.PHYSICIAN,
  options = {}
) => {
  const { PHYSICIAN_SCHEMA } = require('../validation/schemas')
  return useFormWithValidation(PHYSICIAN_SCHEMA, defaultValues, options)
}

export const useFilterForm = (
  defaultValues = FORM_DEFAULTS.FILTER,
  options = {}
) => {
  const { FILTER_SCHEMA } = require('../validation/schemas')
  return useFormWithValidation(FILTER_SCHEMA, defaultValues, options)
}

// ** Form Field Generators
export const createFormField = (type, props) => {
  const baseProps = {
    type,
    ...props,
  }

  switch (type) {
    case 'text':
    case 'email':
    case 'number':
    case 'password':
      return {
        ...baseProps,
        type,
      }
    case 'select':
      return {
        ...baseProps,
        type: 'select',
      }
    case 'textarea':
      return {
        ...baseProps,
        type: 'textarea',
      }
    default:
      return baseProps
  }
}

// ** Form Layout Utilities
export const formLayoutUtils = {
  // Create form row
  createRow: (children, className = 'mb-1') => ({
    type: 'row',
    className,
    children,
  }),

  // Create form column
  createColumn: (children, md = 6, className = '') => ({
    type: 'column',
    md,
    className,
    children,
  }),

  // Create form group
  createFormGroup: (children, className = '') => ({
    type: 'form-group',
    className,
    children,
  }),
}

// ** Form Data Transformation Utilities
export const formDataUtils = {
  // Transform form data for API submission
  transformForSubmission: (formData, transformations = {}) => {
    const transformed = { ...formData }

    Object.entries(transformations).forEach(([field, transform]) => {
      if (transformed[field] !== undefined) {
        transformed[field] = transform(transformed[field])
      }
    })

    return transformed
  },

  // Clean form data (remove empty strings, null values)
  cleanFormData: (formData) => {
    const cleaned = {}

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          cleaned[key] = value
        } else if (!Array.isArray(value)) {
          cleaned[key] = value
        }
      }
    })

    return cleaned
  },

  // Merge form data with existing data
  mergeFormData: (existingData, formData) => ({
    ...existingData,
    ...formData,
  }),
}
