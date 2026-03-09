import ValidatedFormField from './ValidatedFormField'
import { REGEX_PATTERNS, VALIDATION_MESSAGES } from '../schemas'

/**
 * Specialized Email Field with email validation
 * @param {Object} props - Component props
 */
const EmailField = ({
  name,
  control,
  label = 'Email',
  placeholder = 'Enter email address',
  errors,
  required = true,
  className = '',
  helpText = 'Enter a valid email address',
  ...props
}) => {
  const validation = {
    pattern: {
      value: REGEX_PATTERNS.EMAIL,
      message: VALIDATION_MESSAGES.EMAIL_INVALID,
    },
  }

  return (
    <ValidatedFormField
      name={name}
      control={control}
      label={label}
      type="email"
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

export default EmailField
