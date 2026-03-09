// ** Main Utils Index - Export all utilities from a single entry point

// ** Validation Utilities
export * from './validation/schemas'

// ** Constants
export * from './constants'

// ** Alert Utilities
export * from './alerts'
// ** Form Utilities
export * from './forms'

// ** Helper Utilities
export * from './helpers'

// ** Clinic Utilities
export * from './clinicUtils'

// ** Common Components
export { default as AdditionalDataComponent } from './components/AdditionalDataComponent'
export { default as FormField } from './components/FormField'
export { default as SafeFormField } from './components/SafeFormField'
export { default as CustomModal, FormModal, ConfirmModal } from './components/Modal'

// ** Validation Components
export {
  ValidatedFormField,
  FormValidationWrapper,
  ErrorDisplay,
  FormErrorSummary,
  FieldError,
  EmailField,
  PhoneField,
  NameField,
  PasswordField,
  SelectField,
  NumberField,
  DateField,
} from './validation/components'

// ** Re-export commonly used utilities for convenience
export {
  // Form utilities
  useFormWithValidation,
  createFormResetHandler,
  createFormSubmitHandler,
  formFieldUtils,
  validationUtils,
  useUserForm,
  useClinicForm,
  usePhysicianForm,
  useFilterForm,
} from './forms'

export {
  // Alert utilities
  showLoadingAlert,
  showSuccessAlert,
  showErrorAlert,
  showInfoAlert,
  showConfirm,
  hideLoadingAlert,
  hideLoadingThenShowError,
  getErrorMessage,
  handleApiResponse,
  handleFormSubmission,
} from './alerts'

export {
  // Helper utilities
  dateUtils,
  stringUtils,
  arrayUtils,
  objectUtils,
  numberUtils,
  storageUtils,
  urlUtils,
  debounce,
  throttle,
  generateUUID,
  // Legacy utility functions
  isObjEmpty,
  kFormatter,
  htmlToString,
  isUserLoggedIn,
  getUserData,
  getHomeRouteForLoggedInUser,
  ordinalSuffixOf,
  handleAutoLogout,
  handleSetTimeOut,
  isObject,
  setLockPatientIdsDm,
  getLockPatientIdsDm,
  checkForEditDm,
  checkForOtherOperationDm,
  getStudyLockDataAPIDm,
} from './helpers'

// ** Cross-utility helpers
export { extractErrorMessage } from '../utility/Utils'

export {
  // Constants
  STATUS_OPTIONS,
  EDIT_OPTIONS,
  ACCESS_OPTIONS,
  FORM_DEFAULTS,
  API_ENDPOINTS,
  FIELD_LIMITS,
  selectThemeColors,
} from './constants'

export {
  // Validation schemas and utilities
  REGEX_PATTERNS,
  VALIDATION_MESSAGES,
  createNameValidation,
  createEmailValidation,
  createPhoneValidation,
  createStatusValidation,
  createClinicValidation,
  USER_BASIC_SCHEMA,
  CLINIC_USER_SCHEMA,
  CLINIC_SCHEMA,
  PHYSICIAN_SCHEMA,
  FILTER_SCHEMA,
} from './validation/schemas'
