import ValidatedFormField from './ValidatedFormField'
import { REGEX_PATTERNS, VALIDATION_MESSAGES } from '../schemas'
import { FIELD_LIMITS } from '../../constants'

/**
 * Specialized Name Field with name validation
 * @param {Object} props - Component props
 */
const NameField = ({
  name,
  control,
  label = 'Name',
  placeholder = 'Enter name',
  errors,
  required = true,
  className = '',
  maxLength = FIELD_LIMITS.NAME_MAX_LENGTH,
  helpText = 'Enter only letters and spaces',
  ...props
}) => {
  const validation = {
    pattern: {
      value: REGEX_PATTERNS.ALPHABETIC,
      message: 'Name should contain only letters and spaces',
    },
    validate: {
      noSpacesOnly: value => value.trim().length > 0 || VALIDATION_MESSAGES.NO_SPACES_ONLY(label),
    },
  }

  return (
    <ValidatedFormField
      name={name}
      control={control}
      label={label}
      type="text"
      placeholder={placeholder}
      errors={errors}
      required={required}
      className={className}
      validation={validation}
      maxLength={maxLength}
      helpText={helpText}
      {...props}
    />
  )
}

export default NameField
