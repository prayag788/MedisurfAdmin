import { useState } from 'react'
import ValidatedFormField from './ValidatedFormField'
import { Button, InputGroup, InputGroupText } from 'reactstrap'
import { Eye, EyeOff } from 'react-feather'

/**
 * Specialized Password Field with password validation and show/hide toggle
 * @param {Object} props - Component props
 */
const PasswordField = ({
  name,
  control,
  label = 'Password',
  placeholder = 'Enter password',
  errors,
  required = true,
  className = '',
  helpText = 'Password must be at least 8 characters long',
  minLength = 8,
  showStrength = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const validation = {
    minLength: {
      value: minLength,
      message: `Password must be at least ${minLength} characters long`,
    },
    validate: {
      hasUppercase: (value) =>
        /[A-Z]/.test(value) ||
        'Password must contain at least one uppercase letter',
      hasLowercase: (value) =>
        /[a-z]/.test(value) ||
        'Password must contain at least one lowercase letter',
      hasNumber: (value) =>
        /\d/.test(value) || 'Password must contain at least one number',
      hasSpecialChar: (value) =>
        /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
        'Password must contain at least one special character',
    },
  }

  const renderPasswordInput = (field) => (
    <InputGroup>
      <Input
        {...field}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        invalid={errors && errors[name]}
        {...props}
      />
      <InputGroupText>
        <Button
          type="button"
          color="link"
          className="p-0 border-0"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </InputGroupText>
    </InputGroup>
  )

  return (
    <ValidatedFormField
      name={name}
      control={control}
      label={label}
      type="password"
      placeholder={placeholder}
      errors={errors}
      required={required}
      className={className}
      validation={validation}
      helpText={helpText}
      customRender={renderPasswordInput}
      {...props}
    />
  )
}

export default PasswordField
