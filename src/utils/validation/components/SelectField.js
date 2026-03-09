import ValidatedFormField from './ValidatedFormField'

/**
 * Specialized Select Field with enhanced validation
 * @param {Object} props - Component props
 */
const SelectField = ({
  name,
  control,
  label = 'Select Option',
  errors,
  required = true,
  className = '',
  options = [],
  placeholder = 'Choose an option',
  helpText = 'Please select an option from the list',
  ...props
}) => {
  const validation = {
    validate: {
      notEmpty: value => (value && value !== '') || 'Please select a valid option',
    },
  }

  return (
    <ValidatedFormField
      name={name}
      control={control}
      label={label}
      type="select"
      errors={errors}
      required={required}
      className={className}
      validation={validation}
      options={options}
      helpText={helpText}
      {...props}
    />
  )
}

export default SelectField
