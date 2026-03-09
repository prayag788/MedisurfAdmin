import { Controller } from 'react-hook-form'
import { Input, Label, FormFeedback, FormGroup } from 'reactstrap'

/**
 * Reusable FormField component with React Hook Form integration
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {Object} props.control - React Hook Form control
 * @param {string} props.label - Field label
 * @param {string} props.type - Input type
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} props.errors - Form errors
 * @param {boolean} props.required - Whether field is required
 * @param {Array} props.options - Options for select fields
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.validation - Validation rules
 */
const FormField = ({
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
  ...props
}) => {
  const hasError = errors && errors[name]

  return (
    <FormGroup className={className}>
      {label && (
        <Label for={name}>
          {label}
          {required && <span style={{ color: '#FF0000' }}>*</span>}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field }) => {
          if (type === 'select') {
            return (
              <Input {...field} type="select" invalid={hasError} {...props}>
                <option value="">Select {label}</option>
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
            )
          }

          if (type === 'textarea') {
            return (
              <Input
                {...field}
                type="textarea"
                placeholder={placeholder}
                invalid={hasError}
                {...props}
              />
            )
          }

          return (
            <Input {...field} type={type} placeholder={placeholder} invalid={hasError} {...props} />
          )
        }}
      />

      {hasError && <FormFeedback>{errors[name].message}</FormFeedback>}
    </FormGroup>
  )
}

export default FormField
