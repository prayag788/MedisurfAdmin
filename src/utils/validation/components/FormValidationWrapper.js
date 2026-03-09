import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Form } from 'reactstrap'

/**
 * Form Validation Wrapper that provides form context and validation
 * @param {Object} props - Component props
 * @param {Object} props.schema - Yup validation schema
 * @param {Object} props.defaultValues - Default form values
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Object} props.formOptions - Additional form options
 * @param {React.ReactNode} props.children - Form content
 * @param {string} props.className - Additional CSS class
 */
const FormValidationWrapper = ({
  schema,
  defaultValues = {},
  onSubmit,
  formOptions = {},
  children,
  className = '',
  ...props
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    mode: 'onChange',
    defaultValues,
    shouldUnregister: true,
    ...formOptions,
  })

  const formContext = {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    isValid,
    reset,
    setValue,
    getValues,
    watch,
    trigger,
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={className} {...props}>
      {typeof children === 'function' ? children(formContext) : children}
    </Form>
  )
}

export default FormValidationWrapper
