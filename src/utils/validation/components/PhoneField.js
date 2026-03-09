import ValidatedFormField from './ValidatedFormField'
import { REGEX_PATTERNS, VALIDATION_MESSAGES } from '../schemas'

/**
 * Specialized Phone Field with phone number validation
 * @param {Object} props - Component props
 */
const PhoneField = ({
  name,
  control,
  label = 'Phone Number',
  placeholder = 'Enter phone number',
  errors,
  required = false,
  className = '',
  helpText = 'Enter a valid phone number',
  ...props
}) => {
  const validation = {
    pattern: {
      value: REGEX_PATTERNS.PHONE,
      message: VALIDATION_MESSAGES.PHONE_INVALID,
    },
  }

  return (
    <ValidatedFormField
      name={name}
      control={control}
      label={label}
      type="tel"
      placeholder={placeholder}
      errors={errors}
      required={required}
      className={className}
      validation={validation}
      helpText={helpText}
      {...props}
    />
  )
}

export default PhoneField
