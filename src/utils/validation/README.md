# Validation Components

This directory contains reusable validation components that provide consistent form validation across the entire application.

## 📁 Directory Structure

```
src/utils/validation/
├── components/           # Validation component files
│   ├── ValidatedFormField.js      # Base validated form field
│   ├── EmailField.js              # Email validation component
│   ├── PhoneField.js              # Phone validation component
│   ├── NameField.js               # Name validation component
│   ├── PasswordField.js           # Password validation component
│   ├── SelectField.js             # Select validation component
│   ├── NumberField.js             # Number validation component
│   ├── DateField.js               # Date validation component
│   ├── FormValidationWrapper.js   # Form wrapper with validation
│   ├── ErrorDisplay.js            # Error display components
│   ├── ExampleForm.js             # Example usage
│   └── index.js                   # Component exports
├── schemas.js            # Validation schemas and utilities
└── README.md            # This documentation
```

## 🚀 Quick Start

```javascript
import {
  FormValidationWrapper,
  NameField,
  EmailField,
  PhoneField,
  SelectField,
  FormErrorSummary,
  USER_BASIC_SCHEMA,
} from '../../utils'

const MyForm = ({ onSubmit }) => {
  return (
    <FormValidationWrapper
      schema={USER_BASIC_SCHEMA}
      defaultValues={{ fname: '', lname: '', email: '' }}
      onSubmit={onSubmit}
    >
      {({ control, errors, handleSubmit, isSubmitting }) => (
        <>
          <FormErrorSummary errors={errors} />

          <NameField
            name="fname"
            control={control}
            label="First Name"
            errors={errors}
            required={true}
          />

          <EmailField
            name="email"
            control={control}
            label="Email"
            errors={errors}
            required={true}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </>
      )}
    </FormValidationWrapper>
  )
}
```

## 📋 Available Components

### 🎯 Base Components

#### `ValidatedFormField`

Enhanced form field with advanced validation features.

**Props:**

- `name` - Field name
- `control` - React Hook Form control
- `label` - Field label
- `type` - Input type (text, email, password, number, tel, url, etc.)
- `placeholder` - Placeholder text
- `errors` - Form errors object
- `required` - Whether field is required
- `options` - Options for select fields
- `className` - Additional CSS class
- `validation` - Custom validation rules
- `helpText` - Help text to display below field
- `disabled` - Whether field is disabled
- `maxLength` - Maximum length for text inputs
- `minLength` - Minimum length for text inputs
- `pattern` - Regex pattern for validation
- `min` - Minimum value for number inputs
- `max` - Maximum value for number inputs
- `step` - Step value for number inputs

#### `FormValidationWrapper`

Form wrapper that provides validation context and form state.

**Props:**

- `schema` - Yup validation schema
- `defaultValues` - Default form values
- `onSubmit` - Form submission handler
- `formOptions` - Additional form options
- `children` - Form content (function or React elements)

### 🔧 Specialized Field Components

#### `EmailField`

Email field with built-in email validation.

```javascript
<EmailField
  name="email"
  control={control}
  label="Email Address"
  placeholder="Enter email address"
  errors={errors}
  required={true}
  helpText="Enter a valid email address"
/>
```

#### `PhoneField`

Phone field with built-in phone number validation.

```javascript
<PhoneField
  name="phone"
  control={control}
  label="Phone Number"
  placeholder="Enter phone number"
  errors={errors}
  required={false}
/>
```

#### `NameField`

Name field with alphabetic validation and space handling.

```javascript
<NameField
  name="fname"
  control={control}
  label="First Name"
  placeholder="Enter first name"
  errors={errors}
  required={true}
  maxLength={25}
/>
```

#### `PasswordField`

Password field with strength validation and show/hide toggle.

```javascript
<PasswordField
  name="password"
  control={control}
  label="Password"
  placeholder="Enter password"
  errors={errors}
  required={true}
  minLength={8}
  showStrength={true}
/>
```

#### `SelectField`

Select field with enhanced validation.

```javascript
<SelectField
  name="status"
  control={control}
  label="Status"
  options={STATUS_OPTIONS}
  errors={errors}
  required={true}
/>
```

#### `NumberField`

Number field with range validation.

```javascript
<NumberField
  name="age"
  control={control}
  label="Age"
  placeholder="Enter age"
  errors={errors}
  min={18}
  max={100}
  step={1}
/>
```

#### `DateField`

Date field with date validation using Flatpickr.

```javascript
<DateField
  name="birthDate"
  control={control}
  label="Birth Date"
  placeholder="Select date"
  errors={errors}
  maxDate={new Date()}
  enableTime={false}
/>
```

### 🚨 Error Display Components

#### `ErrorDisplay`

General purpose error display component.

```javascript
<ErrorDisplay
  type="error" // error, warning, info, success
  title="Error Title"
  message="Error message"
  dismissible={true}
  onDismiss={() => {}}
/>
```

#### `FormErrorSummary`

Displays all form errors in a summary format.

```javascript
<FormErrorSummary
  errors={errors}
  title="Please fix the following errors:"
  dismissible={false}
/>
```

#### `FieldError`

Displays individual field errors.

```javascript
<FieldError error={errors.fieldName} />
```

## 🎨 Styling and Theming

All validation components use Bootstrap classes and can be styled with custom CSS:

```css
/* Custom validation styling */
.form-control.is-invalid {
  border-color: #dc3545;
}

.form-text.text-muted {
  font-size: 0.875rem;
}

.alert {
  border-radius: 0.375rem;
}
```

## 📝 Validation Rules

### Built-in Validation Rules

Each field type comes with appropriate validation rules:

- **Email**: Valid email format using regex
- **Phone**: Valid phone number format
- **Name**: Alphabetic characters only, no spaces only
- **Password**: Minimum length, complexity requirements
- **Number**: Numeric validation, range constraints
- **Date**: Valid date format, date range constraints

### Custom Validation

You can add custom validation rules:

```javascript
<ValidatedFormField
  name="customField"
  control={control}
  validation={{
    validate: {
      customRule: (value) => value === 'expected' || 'Custom error message',
    },
  }}
/>
```

## 🔄 Form State Management

The `FormValidationWrapper` provides access to form state:

```javascript
<FormValidationWrapper onSubmit={handleSubmit}>
  {({
    control,      // React Hook Form control
    errors,       // Form errors object
    handleSubmit, // Form submission handler
    isSubmitting, // Loading state
    isValid,      // Form validity
    reset,        // Reset form function
    setValue,     // Set field value function
    getValues,    // Get form values function
    watch,        // Watch field changes
    trigger       // Trigger validation function
  }) => (
    // Form content
  )}
</FormValidationWrapper>
```

## 🎯 Best Practices

### 1. Use Appropriate Field Types

```javascript
// ✅ Good - Use specialized components
<EmailField name="email" control={control} errors={errors} />

// ❌ Avoid - Generic field for specific types
<ValidatedFormField name="email" type="text" control={control} errors={errors} />
```

### 2. Provide Helpful Error Messages

```javascript
// ✅ Good - Specific error message
<NumberField
  name="age"
  control={control}
  errors={errors}
  helpText="Age must be between 18 and 100"
/>

// ❌ Avoid - Generic error message
<NumberField name="age" control={control} errors={errors} />
```

### 3. Use Form Error Summary

```javascript
// ✅ Good - Show all errors at once
<FormErrorSummary errors={errors} />

// ❌ Avoid - Only individual field errors
```

### 4. Handle Loading States

```javascript
// ✅ Good - Disable form during submission
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

### 5. Provide Default Values

```javascript
// ✅ Good - Set appropriate defaults
<FormValidationWrapper
  defaultValues={{ status: 1, isActive: true }}
  onSubmit={handleSubmit}
>
```

## 🐛 Troubleshooting

### Common Issues

1. **Field not validating**: Ensure `control` prop is passed correctly
2. **Error not displaying**: Check that `errors` prop contains the field error
3. **Custom validation not working**: Verify validation rules syntax
4. **Date picker not working**: Ensure Flatpickr styles are imported

### Debug Mode

Enable debug mode to see validation details:

```javascript
<FormValidationWrapper
  formOptions={{ mode: 'onChange' }}
  onSubmit={handleSubmit}
>
```

## 🚀 Advanced Usage

### Custom Field Component

```javascript
const CustomField = ({ name, control, errors, ...props }) => {
  return (
    <ValidatedFormField
      name={name}
      control={control}
      errors={errors}
      validation={{
        validate: {
          customRule: (value) => customValidation(value),
        },
      }}
      {...props}
    />
  )
}
```

### Dynamic Validation

```javascript
const DynamicForm = ({ userType }) => {
  const schema = useMemo(() => {
    return userType === 'admin' ? ADMIN_SCHEMA : USER_SCHEMA
  }, [userType])

  return (
    <FormValidationWrapper schema={schema} onSubmit={handleSubmit}>
      {/* Form content */}
    </FormValidationWrapper>
  )
}
```

## 📚 Examples

See `ExampleForm.js` for a complete example of how to use all validation components together.

## 🔮 Future Enhancements

- [ ] Add file upload validation
- [ ] Implement async validation
- [ ] Add form wizard support
- [ ] Create validation testing utilities
- [ ] Add accessibility improvements
- [ ] Implement internationalization
