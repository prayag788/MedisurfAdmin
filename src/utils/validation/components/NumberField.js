import ValidatedFormField from './ValidatedFormField'

/**
 * Specialized Number Field with number validation
 * @param {Object} props - Component props
 */
const NumberField = ({
  name,
  control,
  label = 'Number',
  placeholder = 'Enter number',
  errors,
  required = false,
  className = '',
  min,
  max,
  step = 1,
  helpText,
  ...props
}) => {
  const validation = {
    min:
      min !== undefined
        ? {
            value: min,
            message: `Value must be at least ${min}`,
          }
        : undefined,
    max:
      max !== undefined
        ? {
            value: max,
            message: `Value must not exceed ${max}`,
          }
        : undefined,
    pattern: {
      value: /^\d*\.?\d+$/,
      message: 'Please enter a valid number',
    },
  }

  // Remove undefined validation rules
  Object.keys(validation).forEach((key) => {
    if (validation[key] === undefined) {
      delete validation[key]
    }
  })

  return (
    <ValidatedFormField
      name={name}
      control={control}
      label={label}
      type="number"
      placeholder={placeholder}
      errors={errors}
      required={required}
      className={className}
      validation={validation}
      min={min}
      max={max}
      step={step}
      helpText={
        helpText ||
        (min !== undefined && max !== undefined
          ? `Enter a number between ${min} and ${max}`
          : 'Enter a valid number')
      }
      {...props}
    />
  )
}

export default NumberField
