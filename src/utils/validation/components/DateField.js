import { Controller } from 'react-hook-form'
import { Label, FormFeedback, FormGroup } from 'reactstrap'
import Flatpickr from 'react-flatpickr'
import moment from 'moment'

/**
 * Specialized Date Field with date validation
 * @param {Object} props - Component props
 */
const DateField = ({
  name,
  control,
  label = 'Date',
  placeholder = 'Select date',
  errors,
  required = false,
  className = '',
  helpText = 'Select a valid date',
  minDate,
  maxDate,
  dateFormat = 'Y-m-d',
  enableTime = false,
  timeFormat = 'H:i',
  ...props
}) => {
  const hasError = errors && errors[name]
  const errorMessage = hasError ? errors[name].message : ''

  const validation = {
    validate: {
      isValidDate: value => {
        if (!value) return required ? 'Date is required' : true
        return moment(value).isValid() || 'Please enter a valid date'
      },
      isAfterMin: value => {
        if (!value || !minDate) return true
        return (
          moment(value).isAfter(moment(minDate)) ||
          `Date must be after ${moment(minDate).format('MM/DD/YYYY')}`
        )
      },
      isBeforeMax: value => {
        if (!value || !maxDate) return true
        return (
          moment(value).isBefore(moment(maxDate)) ||
          `Date must be before ${moment(maxDate).format('MM/DD/YYYY')}`
        )
      },
    },
  }

  const flatpickrOptions = {
    dateFormat: enableTime ? `${dateFormat} ${timeFormat}` : dateFormat,
    enableTime,
    minDate: minDate ? new Date(minDate) : undefined,
    maxDate: maxDate ? new Date(maxDate) : undefined,
    ...props,
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
        rules={validation}
        render={({ field }) => (
          <Flatpickr
            {...field}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            placeholder={placeholder}
            options={flatpickrOptions}
            onChange={dates => field.onChange(dates[0])}
          />
        )}
      />

      {hasError && <FormFeedback className="d-block">{errorMessage}</FormFeedback>}

      {helpText && !hasError && <small className="form-text text-muted">{helpText}</small>}
    </FormGroup>
  )
}

export default DateField
