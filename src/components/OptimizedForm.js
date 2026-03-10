import React, {
  useState,
  useTransition,
  useDeferredValue,
  useCallback,
  useMemo,
} from 'react'
import { Form, FormGroup, Label, Input, Button, FormFeedback } from 'reactstrap'

// React 18 optimized form with concurrent features
const OptimizedForm = ({
  initialValues = {},
  onSubmit,
  validationSchema,
  children,
  ...props
}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isPending, startTransition] = useTransition()

  // Use deferred value for non-urgent form updates
  const deferredValues = useDeferredValue(values)

  // Memoized validation to prevent unnecessary re-runs
  const validationErrors = useMemo(() => {
    if (!validationSchema) return {}

    try {
      validationSchema.validateSync(deferredValues, { abortEarly: false })
      return {}
    } catch (error) {
      const validationErrors = {}
      error.inner?.forEach((err) => {
        validationErrors[err.path] = err.message
      })
      return validationErrors
    }
  }, [deferredValues, validationSchema])

  // Optimized field update handler with startTransition
  const handleFieldChange = useCallback(
    (fieldName, value) => {
      startTransition(() => {
        setValues((prev) => ({
          ...prev,
          [fieldName]: value,
        }))

        // Clear field-specific error
        if (errors[fieldName]) {
          setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
          })
        }
      })
    },
    [errors]
  )

  // Optimized form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    },
    [values, validationErrors, onSubmit]
  )

  // Render optimized form field
  const renderField = useCallback(
    (fieldConfig) => {
      const {
        name,
        label,
        type = 'text',
        required = false,
        ...fieldProps
      } = fieldConfig

      return (
        <FormGroup key={name}>
          <Label for={name}>
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </Label>
          <Input
            id={name}
            name={name}
            type={type}
            value={values[name] || ''}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            invalid={!!errors[name]}
            disabled={isPending}
            {...fieldProps}
          />
          {errors[name] && <FormFeedback>{errors[name]}</FormFeedback>}
        </FormGroup>
      )
    },
    [values, errors, handleFieldChange, isPending]
  )

  return (
    <Form onSubmit={handleSubmit} {...props}>
      {children ? (
        React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.props.name) {
            return React.cloneElement(child, {
              value: values[child.props.name] || '',
              onChange: (e) =>
                handleFieldChange(child.props.name, e.target.value),
              invalid: !!errors[child.props.name],
              disabled: isPending,
              error: errors[child.props.name],
            })
          }
          return child
        })
      ) : (
        <div>
          {Object.keys(initialValues).map((fieldName) =>
            renderField({ name: fieldName, label: fieldName })
          )}
        </div>
      )}

      <div className="d-flex gap-2 mt-3">
        <Button
          type="submit"
          color="primary"
          disabled={isPending}
          className="d-flex align-items-center"
        >
          {isPending ? (
            <>
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </div>
              Processing...
            </>
          ) : (
            'Submit'
          )}
        </Button>

        <Button
          type="button"
          color="secondary"
          outline
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              setValues(initialValues)
              setErrors({})
            })
          }}
        >
          Reset
        </Button>
      </div>
    </Form>
  )
}

export default OptimizedForm
