import { ordinalSuffixOf } from '@utils'
import { Button, FormFeedback, FormGroup, Input, Label } from 'reactstrap'

const AdditionalDataComponent = ({
  fieldName,
  title,
  limit,
  inputType,
  formData,
  errors,
  setFormData,
  setValue,
  getValues,
  placeholder,
  control,
}) => {
  const addMoreEmails = () => {
    setValue(fieldName, getValues()[fieldName] ? [...getValues()[fieldName], ''] : [])
    setFormData(prev => {
      return {
        ...prev,
        ...getValues(),
        [fieldName]: getValues()[fieldName] ? [...getValues()[fieldName], ''] : [''],
      }
    })
  }
  return (
    <>
      {formData &&
        formData[fieldName]?.map((email, index) => (
          <FormGroup key={`${index + fieldName}`}>
            <Label
              className="w-100 d-flex align-items-center"
              style={{ gap: '3px' }}
              for={`${fieldName}.${index}`}
            >
              {' '}
              <span>
                {index + 2}
                <sup>{`${ordinalSuffixOf(index + 2)}`}</sup> {title}
              </span>{' '}
              <span style={{ color: '#FF0000' }}>*</span>
              <div style={{ marginLeft: 'auto' }}>
                <i
                  className="pi pi-times"
                  style={{ fontSize: '1rem', cursor: 'pointer', marginLeft: 'auto' }}
                  onClick={() => {
                    setFormData(prev => {
                      let newSecondaryEmail = getValues()[fieldName]
                      newSecondaryEmail = newSecondaryEmail.filter((email, i) => i !== index)
                      setValue(fieldName, newSecondaryEmail)
                      return { ...prev, [fieldName]: newSecondaryEmail }
                    })
                  }}
                ></i>
              </div>
            </Label>

            <Input
              type={inputType}
              id={`${fieldName}.${index}`}
              placeholder={placeholder}
              invalid={errors && errors?.[fieldName] && errors[fieldName]?.[index] && true}
              value={getValues()[fieldName]?.[index] ?? ''}
              onChange={e => {
                const arr = [...(getValues()[fieldName] || [])]
                arr[index] = e.target.value
                setValue(fieldName, arr, { shouldValidate: false })
                setFormData(prev => ({ ...prev, [fieldName]: arr }))
              }}
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
            id={`${fieldName} button`}
            onClick={() => addMoreEmails()}
            className="cursor-pointer"
          >
            {' '}
            <i className="pi pi-plus" style={{ fontSize: '1rem' }}></i> {title}
          </Button>
        </div>
      )}
    </>
  )
}

export default AdditionalDataComponent
