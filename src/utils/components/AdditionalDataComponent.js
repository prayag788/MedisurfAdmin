import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap'
import { ordinalSuffixOf } from '@utils'

/**
 * Reusable AdditionalDataComponent for dynamic form fields
 * @param {Object} props - Component props
 * @param {string} props.fieldName - Name of the field
 * @param {string} props.title - Title for the field
 * @param {number} props.limit - Maximum number of fields
 * @param {string} props.inputType - Type of input (email, number, etc.)
 * @param {Object} props.formData - Form data object
 * @param {Object} props.errors - Form errors object
 * @param {Function} props.setFormData - Function to set form data
 * @param {Function} props.setValue - Function to set field value
 * @param {Function} props.getValues - Function to get field values
 * @param {string} props.placeholder - Placeholder text for inputs
 * @param {string} props.className - Additional CSS class
 */
const AdditionalDataComponent = ({
  fieldName,
  title,
  limit = 2,
  inputType = 'text',
  formData,
  errors,
  setFormData,
  setValue,
  getValues,
  placeholder = '',
  className = '',
}) => {
  const addMoreFields = () => {
    const currentValues = getValues()[fieldName] || []
    const newValues = [...currentValues, '']

    setValue(fieldName, newValues)
    setFormData((prev) => ({
      ...prev,
      ...getValues(),
      [fieldName]: newValues,
    }))
  }

  const removeField = (index) => {
    const currentValues = getValues()[fieldName] || []
    const newValues = currentValues.filter((_, i) => i !== index)

    setValue(fieldName, newValues)
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValues,
    }))
  }

  const updateField = (index, value) => {
    const currentValues = getValues()[fieldName] || []
    const newValues = [...currentValues]
    newValues[index] = value

    setValue(fieldName, newValues)
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValues,
    }))
  }

  return (
    <div className={className}>
      {formData &&
        formData[fieldName]?.map((value, index) => (
          <FormGroup key={`${index + fieldName}`}>
            <Label
              className="w-100 d-flex align-items-center"
              style={{ gap: '3px' }}
            >
              <span>
                {index + 2}
                <sup>{`${ordinalSuffixOf(index + 2)}`}</sup> {title}
              </span>
              <span style={{ color: '#FF0000' }}>*</span>
              <div style={{ marginLeft: 'auto' }}>
                <i
                  className="pi pi-times"
                  style={{
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                  }}
                  onClick={() => removeField(index)}
                />
              </div>
            </Label>

            <Input
              type={inputType}
              name={`${fieldName}[${index}]`}
              id={`${fieldName}.${index}`}
              value={value || ''}
              onChange={(e) => updateField(index, e.target.value)}
              invalid={
                errors &&
                errors?.[fieldName] &&
                errors[fieldName]?.[index] &&
                true
              }
              placeholder={placeholder}
            />

            {errors && errors?.[fieldName] && errors?.[fieldName]?.[index] && (
              <FormFeedback>{`${errors[fieldName]?.[index]?.message ?? ''}`}</FormFeedback>
            )}
          </FormGroup>
        ))}

      {formData && formData[fieldName]?.length < limit && (
        <div className="d-flex justify-content-end">
          <Button
            color="primary"
            type="button"
            onClick={addMoreFields}
            className="cursor-pointer"
          >
            <i className="pi pi-plus" style={{ fontSize: '1rem' }}></i>
            {title}
          </Button>
        </div>
      )}
    </div>
  )
}

export default AdditionalDataComponent
