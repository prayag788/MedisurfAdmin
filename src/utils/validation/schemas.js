import * as yup from 'yup'

import { FIELD_LIMITS } from '../constants'

// ** Common Regex Patterns
export const REGEX_PATTERNS = {
  PHONE: /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im,
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  WEBSITE:
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ALPHABETIC: /^[a-zA-Z\s]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
}

// ** Common Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: field => `${field} is required!`,
  EMAIL_INVALID: 'Please provide valid email address',
  EMAIL_REQUIRED: 'Please provide your email address. This field is required.',
  PHONE_INVALID: 'Please enter a valid contact number',
  NAME_TOO_LONG: maxLength => `Name cannot be longer than ${maxLength} characters`,
  NAME_REQUIRED: field => `${field} is required!`,
  NO_SPACES_ONLY: field => `${field} cannot be only spaces`,
  STATUS_REQUIRED: 'Please select a valid status',
  CLINIC_REQUIRED: 'At least one clinic is required',
  MIN_LENGTH: (field, min) => `At least ${min} ${field} is required`,
}

// ** Common Field Validations
export const createNameValidation = (fieldName, maxLength = 25, isRequired = true) => {
  let validation = yup.string()

  if (maxLength) {
    validation = validation.max(maxLength, VALIDATION_MESSAGES.NAME_TOO_LONG(maxLength))
  }

  if (isRequired) {
    validation = validation
      .required(VALIDATION_MESSAGES.NAME_REQUIRED(fieldName))
      .test(
        'no-space',
        VALIDATION_MESSAGES.NO_SPACES_ONLY(fieldName),
        value => value.trim().length > 0
      )
  }

  return validation
}

export const createEmailValidation = (isRequired = true) => {
  let validation = yup.string().email(VALIDATION_MESSAGES.EMAIL_INVALID)

  if (isRequired) {
    validation = validation.required(VALIDATION_MESSAGES.EMAIL_REQUIRED)
  }

  return validation
}

export const createPhoneValidation = (isRequired = false) => {
  let validation = yup.string().matches(REGEX_PATTERNS.PHONE, VALIDATION_MESSAGES.PHONE_INVALID)

  if (isRequired) {
    validation = validation.required(VALIDATION_MESSAGES.PHONE_INVALID)
  }

  return validation
}

export const createStatusValidation = () => {
  return yup
    .number()
    .oneOf([0, 1], VALIDATION_MESSAGES.STATUS_REQUIRED)
    .required(VALIDATION_MESSAGES.STATUS_REQUIRED)
}

export const createClinicValidation = () => {
  return yup
    .array()
    .of(
      yup.object().shape({
        _id: yup.string().required('Id is required!'),
        clinicName: yup.string().required('Clinic Name is required!'),
      })
    )
    .required('Clinics field is required!')
    .min(1, VALIDATION_MESSAGES.CLINIC_REQUIRED)
}

// ** Pre-built Schemas
export const USER_BASIC_SCHEMA = yup.object().shape({
  physicianname: yup.mixed().required('Physician Name is required!'),
  email: createEmailValidation(),
  cno: createPhoneValidation(),
  hospitalname: yup
    .string()
    .max(
      FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH,
      VALIDATION_MESSAGES.NAME_TOO_LONG(FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH)
    )
    .required('Hospital Name is required!'),
  designation: yup.string().max(25, VALIDATION_MESSAGES.NAME_TOO_LONG(25)),
  location: yup.string().required('Location is required!'),
  dob: yup.string(),
  medicalQualifications: yup.string(),
  boardCertifications: yup.string(),
  referenceId: yup.string(),
  digitalSignature: yup.string(),
  clinics: createClinicValidation(),
  status: createStatusValidation(),
})

export const CLINIC_USER_SCHEMA = yup.object().shape({
  fname: createNameValidation('First Name'),
  lname: createNameValidation('Last Name'),
  email: createEmailValidation(),
  cno: createPhoneValidation(false),
  status: createStatusValidation(),
  clinics: createClinicValidation(),
})

export const CLINIC_SCHEMA = yup.object().shape({
  clinicName: yup
    .string()
    .max(
      FIELD_LIMITS.CLINIC_NAME_MAX_LENGTH,
      VALIDATION_MESSAGES.NAME_TOO_LONG(FIELD_LIMITS.CLINIC_NAME_MAX_LENGTH)
    )
    .required(VALIDATION_MESSAGES.NAME_REQUIRED('Clinic Name')),
  email: createEmailValidation(),
  cno: createPhoneValidation(),
  status: createStatusValidation(),
  allow_edit_patient_details: yup
    .number()
    .oneOf([0, 1], 'Please select a valid option')
    .required('Please select option'),
})

export const PHYSICIAN_SCHEMA = yup.object().shape({
  physicianname: yup.mixed().required('Physician Name is required!'),
  email: createEmailValidation(),
  cno: createPhoneValidation(),
  hospitalname: yup
    .string()
    .max(
      FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH,
      VALIDATION_MESSAGES.NAME_TOO_LONG(FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH)
    )
    .required('Hospital Name is required!'),
  designation: yup.string().max(25, VALIDATION_MESSAGES.NAME_TOO_LONG(25)),
  location: yup.string().required('Location is required!'),
  status: createStatusValidation(),
  clinics: createClinicValidation(),
})

export const FILTER_SCHEMA = yup
  .object()
  .shape({
    name: yup
      .string()
      .max(25, VALIDATION_MESSAGES.NAME_TOO_LONG(25))
      .required(VALIDATION_MESSAGES.NAME_REQUIRED('Filter Name')),
    clinicNames: yup.array().of(
      yup.object().shape({
        _id: yup.string().required(),
        clinicName: yup.string().required(),
      })
    ),
    status: yup.object().required(),
    modality: yup.array().of(
      yup.object().shape({
        label: yup.string().required('label is required!'),
        value: yup.string().required('value is required!'),
      })
    ),
    studyStatus: yup.array().of(
      yup.object().shape({
        label: yup.string().required('label is required!'),
        value: yup.string().required('value is required!'),
      })
    ),
  })
  .test(
    'at-least-one',
    'Select Atleast One Of The Filtering Criteria(Modalities, Physicians, Clinic Names, Study Status)',
    function (value) {
      const { modality, clinicNames, studyStatus } = value
      return modality?.length > 0 || clinicNames?.length > 0 || studyStatus?.length > 0
    }
  )
  .required()
