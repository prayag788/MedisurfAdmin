// ** React Select Theme Colors - Original Theme Configuration
export const selectThemeColors = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#7367f01a', // for option hover bg-color
    primary: '#7367f0', // for selected option bg-color
    neutral10: '#7367f0', // for tags bg-color
    neutral20: '#ededed', // for input border-color
    neutral30: '#ededed', // for input hover border-color
  },
})

// ** Status Options
export const STATUS_OPTIONS = [
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' },
]

// ** Edit Options (Yes/No)
export const EDIT_OPTIONS = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' },
]

// ** Access Options for Power Users
export const ACCESS_OPTIONS = [
  {
    value: [
      { action: 'manage', subject: 'study-list' },
      { action: 'manage', subject: 'viewer' },
    ],
    label: 'Study List',
    isFixed: false,
  },
  {
    value: { action: 'manage', subject: 'upload-dicom' },
    label: 'Upload Dicom Image',
    isFixed: false,
  },
  {
    value: { action: 'manage', subject: 'referring-doctor' },
    label: 'Referring Doctor',
    isFixed: true,
  },
  {
    value: { action: 'manage', subject: 'clinic-user' },
    label: 'Clinic User',
    isFixed: false,
  },
  {
    value: [
      { action: 'manage', subject: 'modality' },
      { action: 'manage', subject: 'add_modality' },
      { action: 'manage', subject: 'edit_modality' },
    ],
    label: 'Modality',
    isFixed: true,
  },
  {
    value: { action: 'manage', subject: 't&c' },
    label: 'Terms & Conditions',
    isFixed: true,
  },
  {
    value: { action: 'manage', subject: 'privacy-policy' },
    label: 'Privacy Policy',
    isFixed: true,
  },
  {
    value: { action: 'manage', subject: 'cookie-policy' },
    label: 'Cookie Policy',
    isFixed: true,
  },
  {
    value: { action: 'manage', subject: 'data-analytics' },
    label: 'Data Analytics',
    isFixed: false,
  },
]

// ** Study Status Options
export const STUDY_STATUS_OPTIONS = {
  Unread: 'Unread',
  Preliminary: 'Preliminary',
  Ready: 'Ready',
  Final: 'Final',
  Cancelled: 'Cancelled',
}

// ** Priority Options
export const PRIORITY_OPTIONS = [
  { value: 'Stat', label: 'Stat' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]

// ** Modality Options
export const MODALITY_OPTIONS = [
  { value: 'CT', label: 'CT' },
  { value: 'MRI', label: 'MRI' },
  { value: 'X-Ray', label: 'X-Ray' },
  { value: 'Ultrasound', label: 'Ultrasound' },
  { value: 'PET', label: 'PET' },
  { value: 'Nuclear Medicine', label: 'Nuclear Medicine' },
]

// ** Filter Status Options
export const FILTER_STATUS_OPTIONS = [
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' },
]

// ** User Roles
export const USER_ROLES = {
  ClinicAdmin: 'ClinicAdmin',
  ClinicUser: 'ClinicUser',
  Physician: 'Physician',
  PowerUser: 'PowerUser',
  RadiologistUser: 'RadiologistUser',
  TechnicianUser: 'TechnicianUser',
  ReferringDoctor: 'ReferringDoctor',
}

// ** Form Default Values
export const FORM_DEFAULTS = {
  USER: {
    fname: '',
    lname: '',
    email: '',
    cno: '',
    hospitalname: '',
    designation: '',
    location: '',
    dob: '',
    medicalQualifications: '',
    boardCertifications: '',
    referenceId: '',
    digitalSignature: '',
    secondaryCno: [],
    secondaryEmail: [],
    status: 1,
  },
  CLINIC: {
    _id: '',
    clinicName: '',
    email: '',
    cno: '',
    secondaryCno: [],
    secondaryEmail: [],
    status: 1,
    allow_edit_patient_details: 0,
  },
  PHYSICIAN: {
    physicianname: '',
    email: '',
    cno: '',
    hospitalname: '',
    location: '',
    designation: '',
    dob: '',
    secondaryCno: [],
    secondaryEmail: [],
    status: 1,
    clinics: [],
  },
  FILTER: {
    name: '',
    clinicNames: [],
    modality: [],
    studyStatus: [],
    status: 1,
  },
}

// ** API Endpoints
export const API_ENDPOINTS = {
  USERS: '/users',
  CLINICS: '/clinics',
  PHYSICIANS: '/physicians',
  FILTERS: '/filter-module',
  ANALYTICS: '/analytics',
  DROPDOWN_DATA: '/dropdownData',
}

// ** Table Pagination
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  INITIAL_PAGE: 1,
}

// ** Form Field Limits
export const FIELD_LIMITS = {
  NAME_MAX_LENGTH: 25,
  CLINIC_NAME_MAX_LENGTH: 100,
  HOSPITAL_NAME_MAX_LENGTH: 100,
  FILTER_NAME_MAX_LENGTH: 25,
  SECONDARY_EMAIL_LIMIT: 2,
  SECONDARY_PHONE_LIMIT: 2,
}
