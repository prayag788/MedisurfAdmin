import React from 'react'
import { Controller } from 'react-hook-form'
import { FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '../constants'

// Safe FormField component that handles undefined errors
export const SafeFormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  control,
  errors = {},
  options = null,
  isSelect = false,
  ...props
}) => {
  const error = errors[name]
  const hasError = error && error.message

  if (isSelect && options) {
    return (
      <FormGroup>
        <Label for={name}>
          {label}
          {required && <span style={{ color: '#FF0000' }}>*</span>}
        </Label>
        <Controller
          name={name}
          control={control}
          rules={{ required }}
          render={({ field }) => (
            <Select
              {...field}
              isClearable={false}
              theme={selectThemeColors}
              value={options.find(option => option.value === field.value) || options[0]}
              name={name}
              id={name}
              options={options}
              className="react-select"
              classNamePrefix="select"
              onChange={option => field.onChange(option ? option.value : null)}
            />
          )}
        />
        {hasError && <FormFeedback style={{ display: 'block' }}>{error.message}</FormFeedback>}
      </FormGroup>
    )
  }

  return (
    <FormGroup>
      <Label for={name}>
        {label}
        {required && <span style={{ color: '#FF0000' }}>*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={{ required }}
        render={({ field }) => (
          <Input
            id={name}
            name={name}
            type={type}
            {...field}
            invalid={hasError}
            placeholder={placeholder}
            {...props}
          />
        )}
      />
      {hasError && <FormFeedback>{error.message}</FormFeedback>}
    </FormGroup>
  )
}

export default SafeFormField
