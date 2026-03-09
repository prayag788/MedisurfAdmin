import { Row, Col, Button } from 'reactstrap'
import {
  FormValidationWrapper,
  EmailField,
  PhoneField,
  NameField,
  PasswordField,
  SelectField,
  NumberField,
  DateField,
  FormErrorSummary,
  USER_BASIC_SCHEMA,
  STATUS_OPTIONS,
  showSuccessAlert,
} from '../../index'

/**
 * Example form demonstrating the use of validation components
 */
const ExampleForm = ({ onSubmit, defaultValues = {} }) => {
  const handleSubmit = data => {
    console.log('Form data:', data)
    showSuccessAlert('Form submitted successfully!')
    if (onSubmit) onSubmit(data)
  }

  return (
    <FormValidationWrapper
      schema={USER_BASIC_SCHEMA}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
    >
      {({ control, errors, handleSubmit, isSubmitting }) => (
        <>
          <FormErrorSummary errors={errors} />

          <Row>
            <Col md="6">
              <NameField
                name="fname"
                control={control}
                label="First Name"
                placeholder="Enter first name"
                errors={errors}
                required={true}
              />
            </Col>
            <Col md="6">
              <NameField
                name="lname"
                control={control}
                label="Last Name"
                placeholder="Enter last name"
                errors={errors}
                required={true}
              />
            </Col>
          </Row>

          <Row>
            <Col md="6">
              <EmailField
                name="email"
                control={control}
                label="Email Address"
                placeholder="Enter email address"
                errors={errors}
                required={true}
              />
            </Col>
            <Col md="6">
              <PhoneField
                name="cno"
                control={control}
                label="Contact Number"
                placeholder="Enter phone number"
                errors={errors}
              />
            </Col>
          </Row>

          <Row>
            <Col md="6">
              <PasswordField
                name="password"
                control={control}
                label="Password"
                placeholder="Enter password"
                errors={errors}
                required={true}
                showStrength={true}
              />
            </Col>
            <Col md="6">
              <SelectField
                name="status"
                control={control}
                label="Status"
                options={STATUS_OPTIONS}
                errors={errors}
                required={true}
              />
            </Col>
          </Row>

          <Row>
            <Col md="6">
              <NumberField
                name="age"
                control={control}
                label="Age"
                placeholder="Enter age"
                errors={errors}
                min={18}
                max={100}
                helpText="Age must be between 18 and 100"
              />
            </Col>
            <Col md="6">
              <DateField
                name="birthDate"
                control={control}
                label="Birth Date"
                placeholder="Select birth date"
                errors={errors}
                maxDate={new Date()}
                helpText="Select your birth date"
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </>
      )}
    </FormValidationWrapper>
  )
}

export default ExampleForm
