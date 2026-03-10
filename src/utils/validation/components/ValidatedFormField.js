import { Controller } from 'react-hook-form'
import { Input, Label, FormFeedback, FormGroup } from 'reactstrap'

/**
 * Enhanced FormField component with advanced validation features
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {Object} props.control - React Hook Form control
 * @param {string} props.label - Field label
 * @param {string} props.type - Input type (text, email, password, number, tel, url, etc.)
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} props.errors - Form errors
 * @param {boolean} props.required - Whether field is required
 * @param {Array} props.options - Options for select fields
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.validation - Validation rules
 * @param {string} props.helpText - Help text to display below field
 * @param {boolean} props.disabled - Whether field is disabled
 * @param {number} props.maxLength - Maximum length for text inputs
 * @param {number} props.minLength - Minimum length for text inputs
 * @param {string} props.pattern - Regex pattern for validation
 * @param {number} props.min - Minimum value for number inputs
 * @param {number} props.max - Maximum value for number inputs
 * @param {number} props.step - Step value for number inputs
 * @param {Array} props.rows - Number of rows for textarea
 * @param {Array} props.cols - Number of columns for textarea
 */
const ValidatedFormField = ({
  name,
  control,
  label,
  type = 'text',
  placeholder = '',
  errors,
  required = false,
  options = [],
  className = '',
  validation = {},
  helpText = '',
  disabled = false,
  maxLength,
  minLength,
  pattern,
  min,
  max,
  step,
  rows = 3,
  cols,
  ...props
}) => {
  const hasError = errors && errors[name]
  const errorMessage = hasError ? errors[name].message : ''

  // ** Enhanced validation rules
  const enhancedValidation = {
    ...validation,
    ...(required && { required: `${label || name} is required` }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: `Maximum ${maxLength} characters allowed`,
      },
    }),
    ...(minLength && {
      minLength: {
        value: minLength,
        message: `Minimum ${minLength} characters required`,
      },
    }),
    ...(pattern && {
      pattern: { value: new RegExp(pattern), message: 'Invalid format' },
    }),
    ...(min !== undefined && {
      min: { value: min, message: `Minimum value is ${min}` },
    }),
    ...(max !== undefined && {
      max: { value: max, message: `Maximum value is ${max}` },
    }),
  }

  // ** Get input attributes based on type
  const getInputAttributes = () => {
    const attrs = {
      invalid: hasError,
      disabled,
      ...props,
    }

    if (maxLength) attrs.maxLength = maxLength
    if (minLength) attrs.minLength = minLength
    if (pattern) attrs.pattern = pattern
    if (min !== undefined) attrs.min = min
    if (max !== undefined) attrs.max = max
    if (step !== undefined) attrs.step = step
    if (type === 'textarea') {
      attrs.rows = rows
      if (cols) attrs.cols = cols
    }

    return attrs
  }

  // ** Render input based on type
  const renderInput = (field) => {
    const inputAttrs = getInputAttributes()

    switch (type) {
      case 'select':
        return (
          <Input {...field} type="select" {...inputAttrs}>
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        )

      case 'textarea':
        return (
          <Input
            {...field}
            type="textarea"
            placeholder={placeholder}
            {...inputAttrs}
          />
        )

      case 'checkbox':
        return (
          <Input
            {...field}
            type="checkbox"
            checked={field.value || false}
            {...inputAttrs}
          />
        )

      case 'radio':
        return (
          <div>
            {options.map((option) => (
              <div key={option.value} className="form-check form-check-inline">
                <Input
                  {...field}
                  type="radio"
                  value={option.value}
                  checked={field.value === option.value}
                  className="form-check-input"
                  {...inputAttrs}
                />
                <Label
                  className="form-check-label"
                  for={`${name}-${option.value}`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            {...inputAttrs}
          />
        )
    }
  }

  return (
    <FormGroup className={className}>
      {label && (
        <Label for={name}>
          {label}
          {required && (
            <span style={{ color: '#FF0000' }} className="ms-1">
              *
            </span>
          )}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => renderInput(field)}
      />

      {hasError && (
        <FormFeedback className="d-block">{errorMessage}</FormFeedback>
      )}

      {helpText && !hasError && (
        <small className="form-text text-muted">{helpText}</small>
      )}
    </FormGroup>
  )
}

export default ValidatedFormField
