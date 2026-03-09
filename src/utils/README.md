# Utils Directory Structure

This directory contains reusable utilities, components, and helpers that can be used across the entire application.

## 📁 Directory Structure

```
src/utils/
├── alerts/           # SweetAlert2 utilities
├── api/              # API call utilities
├── components/       # Reusable form components
├── constants/        # Application constants
├── forms/            # Form-related utilities
├── helpers/          # General helper functions
├── validation/       # Validation schemas and utilities
└── index.js          # Main export file
```

## 🚀 Quick Start

```javascript
// Import everything from utils
import { useUserForm, showSuccessAlert, STATUS_OPTIONS, FormField } from '../../utils'

// Or import specific utilities
import { useUserForm } from '../../utils/forms'
import { showSuccessAlert } from '../../utils/alerts'
```

## 📋 Available Utilities

### 🎯 Form Utilities (`forms/`)

**Pre-configured Form Hooks:**

- `useUserForm(defaultValues, options)` - User form with validation
- `useClinicForm(defaultValues, options)` - Clinic form with validation
- `usePhysicianForm(defaultValues, options)` - Physician form with validation
- `useFilterForm(defaultValues, options)` - Filter form with validation

**Form Helpers:**

- `createFormResetHandler(reset, defaultValues)` - Create reset handler
- `createFormSubmitHandler(submitFunction, reset, defaultValues)` - Create submit handler
- `formFieldUtils` - Field creation utilities
- `validationUtils` - Form validation utilities

**Example:**

```javascript
import { useUserForm, createFormSubmitHandler } from '../../utils'

const MyComponent = ({ onSubmit }) => {
  const defaultValues = { fname: '', lname: '', email: '' }
  const { control, handleSubmit, reset } = useUserForm(defaultValues)

  const handleFormSubmit = createFormSubmitHandler(onSubmit, reset, defaultValues)

  return <form onSubmit={handleSubmit(handleFormSubmit)}>{/* Form fields */}</form>
}
```

### 🔔 Alert Utilities (`alerts/`)

**Available Alerts:**

- `showLoadingAlert(title)` - Show loading spinner
- `showSuccessAlert(message, title)` - Show success message
- `showErrorAlert(message, title)` - Show error message
- `showWarningAlert(message, title)` - Show warning message
- `showConfirmDialog(message, title, confirmText)` - Show confirmation dialog
- `showDeleteConfirm(itemName, callback)` - Show delete confirmation
- `handleApiResponse(apiCall, successMessage, errorMessage)` - Handle API responses

**Example:**

```javascript
import { showSuccessAlert, handleApiResponse } from '../../utils'

const saveData = async data => {
  await handleApiResponse(() => api.post('/users', data), 'User created successfully!')
}
```

### 🌐 API Utilities (`api/`)

**Available API Clients:**

- `userApi` - User CRUD operations
- `clinicApi` - Clinic CRUD operations
- `physicianApi` - Physician CRUD operations
- `filterApi` - Filter CRUD operations
- `analyticsApi` - Analytics data
- `dropdownApi` - Dropdown data

**Example:**

```javascript
import { userApi, apiUtils } from '../../utils'

const createUser = async userData => {
  return apiUtils.createWithAlert(() => userApi.create(userData), 'User created successfully!')
}
```

### ✅ Validation Utilities (`validation/`)

**Pre-built Schemas:**

- `USER_BASIC_SCHEMA` - Basic user validation
- `CLINIC_SCHEMA` - Clinic validation
- `PHYSICIAN_SCHEMA` - Physician validation
- `FILTER_SCHEMA` - Filter validation

**Validation Helpers:**

- `createNameValidation(fieldName, maxLength, isRequired)`
- `createEmailValidation(isRequired)`
- `createPhoneValidation(isRequired)`
- `createStatusValidation()`
- `createClinicValidation()`

**Example:**

```javascript
import { createNameValidation, createEmailValidation } from '../../utils'

const customSchema = yup.object().shape({
  name: createNameValidation('Name', 25, true),
  email: createEmailValidation(true),
})
```

### 🧩 Reusable Components (`components/`)

**Available Components:**

- `FormField` - Reusable form field with validation
- `AdditionalDataComponent` - Dynamic field array component
- `CustomModal` - Base modal component
- `FormModal` - Modal with form functionality
- `ConfirmModal` - Confirmation modal

**Example:**

```javascript
import { FormField, AdditionalDataComponent } from '../../utils'

<FormField
  name="email"
  control={control}
  label="Email"
  type="email"
  placeholder="Enter email"
  errors={errors}
  required={true}
/>

<AdditionalDataComponent
  fieldName="secondaryEmail"
  title="Secondary Email"
  limit={2}
  inputType="email"
  formdata={formData}
  errors={errors}
  setFormData={setFormData}
  setValue={setValue}
  getValues={getValues}
/>
```

### 📊 Constants (`constants/`)

**Available Constants:**

- `STATUS_OPTIONS` - Active/Inactive options
- `EDIT_OPTIONS` - Yes/No options
- `ACCESS_OPTIONS` - User access permissions
- `FORM_DEFAULTS` - Default form values
- `API_ENDPOINTS` - API endpoint URLs
- `FIELD_LIMITS` - Form field limits

**Example:**

```javascript
import { STATUS_OPTIONS, FORM_DEFAULTS } from '../../utils'

const defaultValues = FORM_DEFAULTS.USER
const statusOptions = STATUS_OPTIONS
```

### 🛠️ Helper Utilities (`helpers/`)

**Available Helpers:**

- `dateUtils` - Date formatting and manipulation
- `stringUtils` - String manipulation
- `arrayUtils` - Array operations
- `objectUtils` - Object operations
- `numberUtils` - Number formatting
- `storageUtils` - Local storage operations
- `urlUtils` - URL and query parameter utilities

**Example:**

```javascript
import { dateUtils, stringUtils, storageUtils } from '../../utils'

const formattedDate = dateUtils.formatDate(new Date())
const capitalizedName = stringUtils.capitalize('john doe')
const userData = storageUtils.get('userData', {})
```

## 🔄 Migration Guide

### Before (Old Pattern):

```javascript
// Old imports
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// Old form setup
const validationSchema = yup.object().shape({
  fname: yup.string().required('First Name is required!'),
  email: yup.string().email().required('Email is required!'),
})

const { control, handleSubmit } = useForm({
  resolver: yupResolver(validationSchema),
  defaultValues: { fname: '', email: '' },
})
```

### After (New Pattern):

```javascript
// New imports
import { useUserForm, createFormSubmitHandler } from '../../utils'

// New form setup
const { control, handleSubmit, reset } = useUserForm({
  fname: '',
  email: '',
})

const onSubmit = createFormSubmitHandler(handleSubmit, reset, defaultValues)
```

## 📝 Best Practices

1. **Always use utilities** instead of duplicating code
2. **Import from main utils index** for convenience
3. **Use pre-configured form hooks** when possible
4. **Leverage alert utilities** for consistent user feedback
5. **Use API utilities** for standardized API calls
6. **Apply validation utilities** for consistent validation
7. **Utilize helper functions** for common operations

## 🐛 Troubleshooting

**Common Issues:**

1. **Import errors**: Make sure you're importing from the correct path
2. **Missing dependencies**: Ensure all required packages are installed
3. **Validation errors**: Check that validation schemas match your form structure
4. **API errors**: Verify API endpoints and error handling

**Getting Help:**

- Check the utility file comments for usage examples
- Review existing components that use these utilities
- Test utilities in isolation before integrating

## 🚀 Future Enhancements

- [ ] Add TypeScript support
- [ ] Create unit tests for utilities
- [ ] Add more pre-configured form schemas
- [ ] Implement caching utilities
- [ ] Add internationalization helpers
- [ ] Create theme utilities
