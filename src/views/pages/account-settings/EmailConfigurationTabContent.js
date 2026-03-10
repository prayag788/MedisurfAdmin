import {
  Form,
  FormGroup,
  Row,
  Col,
  Card,
  Button,
  Input,
  Label,
  Spinner,
  FormFeedback,
} from 'reactstrap'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { showErrorAlert, showSuccessAlert } from '../../../utils/alerts'

const EmailConfigurationTabContent = ({ activeTab }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [emailType, setEmailType] = useState('mailgun')
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    api_key: '',
    domain: '',
    host: '',
    port: '',
    user: '',
    pass: '',
    secure: false,
    from_name: '',
    from_address: '',
  })

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('accessToken') || localStorage.getItem('authToken')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    }
  }

  useEffect(() => {
    const fetchWebsetup = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL
        const response = await fetch(`${apiUrl}/websetup`, {
          headers: getAuthHeaders(),
        })
        const result = await response.json()
        const data = result?.data || {}

        const provider = data.email_transport || 'mailgun'
        const providerData = data[provider] || {}

        setEmailType(provider)
        setFormData({
          api_key: data.mailgun?.api_key || '',
          domain: data.mailgun?.domain || '',
          host: providerData.host || '',
          port: providerData.port || '',
          user: providerData.user || '',
          pass: providerData.pass || '',
          secure: providerData.secure || false,
          from_name: providerData.from?.name || '',
          from_address: providerData.from?.address || '',
        })
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWebsetup()
  }, [])

  const validateForm = () => {
    const newErrors = {}

    if (emailType === 'mailgun') {
      if (!formData.api_key) newErrors.api_key = 'API key is required'
      if (!formData.domain) newErrors.domain = 'Domain is required'
    } else {
      if (!formData.host) newErrors.host = 'Host is required'
      if (!formData.port) newErrors.port = 'Port is required'
      if (!formData.user) newErrors.user = 'User is required'
      if (!formData.pass) newErrors.pass = 'Password is required'
    }

    if (!formData.from_name) newErrors.from_name = 'From name is required'
    if (!formData.from_address)
      newErrors.from_address = 'From address is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showErrorAlert('Please fill all required fields')
      return
    }

    const apiUrl = process.env.REACT_APP_API_URL
    const headers = getAuthHeaders()

    try {
      if (emailType === 'gmail') {
        const gmailData = {
          host: formData.host,
          port: parseInt(formData.port, 10),
          secure: formData.secure,
          user: formData.user,
          pass: formData.pass,
          from: { name: formData.from_name, address: formData.from_address },
        }

        const response = await fetch(`${apiUrl}/websetup/gmail`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(gmailData),
        })

        const result = await response.json()
        if (!response.ok)
          throw new Error(result.error || 'Failed to save Gmail config')
        showSuccessAlert('Gmail configuration saved successfully!')
      } else if (emailType === 'mailgun') {
        const mailgunData = {
          email_transport: 'mailgun',
          mailgun: {
            api_key: formData.api_key,
            domain: formData.domain,
            from: { name: formData.from_name, address: formData.from_address },
          },
          gmail: {},
          yahoo: {},
          outlook: {},
        }

        const response = await fetch(`${apiUrl}/websetup`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(mailgunData),
        })

        const result = await response.json()
        if (!response.ok)
          throw new Error(result.error || 'Failed to save Mailgun config')
        showSuccessAlert('Mailgun configuration saved successfully!')
      }
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  if (loading) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col sm="12">
          <Label>Email type:</Label>
        </Col>
      </Row>
      <Row>
        <Col sm="12">
          {['mailgun', 'gmail', 'yahoo', 'outlook'].map((option) => (
            <FormGroup key={option} check inline>
              <Input
                type="radio"
                name="emailType"
                value={option}
                id={`${option}Radio`}
                checked={emailType === option}
                onChange={(e) => setEmailType(e.target.value)}
              />
              <Label for={`${option}Radio`}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Label>
            </FormGroup>
          ))}
        </Col>
      </Row>

      {emailType === 'mailgun' && (
        <>
          <Row>
            <Col sm="12">
              <Label for="api_key">API-key:</Label>
              <FormGroup>
                <Input
                  type="text"
                  id="api_key"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleInputChange}
                  invalid={!!errors.api_key}
                />
                {errors.api_key && (
                  <FormFeedback>{errors.api_key}</FormFeedback>
                )}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="12">
              <Label for="domain">Domain-name:</Label>
              <FormGroup>
                <Input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  invalid={!!errors.domain}
                />
                {errors.domain && <FormFeedback>{errors.domain}</FormFeedback>}
              </FormGroup>
            </Col>
          </Row>
        </>
      )}

      {emailType !== 'mailgun' && (
        <>
          <Row>
            <Col sm="12">
              <Label for="host">Host:</Label>
              <FormGroup>
                <Input
                  type="text"
                  id="host"
                  name="host"
                  placeholder="smtp.gmail.com"
                  value={formData.host}
                  onChange={handleInputChange}
                  invalid={!!errors.host}
                />
                {errors.host && <FormFeedback>{errors.host}</FormFeedback>}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="12">
              <Label for="port">Port:</Label>
              <FormGroup>
                <Input
                  type="text"
                  id="port"
                  name="port"
                  placeholder="587"
                  value={formData.port}
                  onChange={handleInputChange}
                  invalid={!!errors.port}
                />
                {errors.port && <FormFeedback>{errors.port}</FormFeedback>}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="12">
              <Label for="user">User:</Label>
              <FormGroup>
                <Input
                  type="email"
                  id="user"
                  name="user"
                  placeholder="your-email@gmail.com"
                  value={formData.user}
                  onChange={handleInputChange}
                  invalid={!!errors.user}
                />
                {errors.user && <FormFeedback>{errors.user}</FormFeedback>}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="12">
              <Label for="pass">Password:</Label>
              <FormGroup>
                <Input
                  type="password"
                  id="pass"
                  name="pass"
                  placeholder="Your app password"
                  value={formData.pass}
                  onChange={handleInputChange}
                  invalid={!!errors.pass}
                />
                {errors.pass && <FormFeedback>{errors.pass}</FormFeedback>}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="12">
              <Label>Secure:</Label>
              <FormGroup check inline>
                <Input
                  type="radio"
                  name="secure"
                  value={true}
                  id="secureTrue"
                  checked={formData.secure === true}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, secure: true }))
                  }
                />
                <Label for="secureTrue">True</Label>
              </FormGroup>
              <FormGroup check inline>
                <Input
                  type="radio"
                  name="secure"
                  value={false}
                  id="secureFalse"
                  checked={formData.secure === false}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, secure: false }))
                  }
                />
                <Label for="secureFalse">False</Label>
              </FormGroup>
            </Col>
          </Row>
        </>
      )}

      <Row>
        <Col sm="12">
          <Label for="from_name">From-name:</Label>
          <FormGroup>
            <Input
              type="text"
              id="from_name"
              name="from_name"
              value={formData.from_name}
              onChange={handleInputChange}
              invalid={!!errors.from_name}
            />
            {errors.from_name && (
              <FormFeedback>{errors.from_name}</FormFeedback>
            )}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm="12">
          <Label for="from_address">From-address:</Label>
          <FormGroup>
            <Input
              type="email"
              id="from_address"
              name="from_address"
              value={formData.from_address}
              onChange={handleInputChange}
              invalid={!!errors.from_address}
            />
            {errors.from_address && (
              <FormFeedback>{errors.from_address}</FormFeedback>
            )}
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col className="mt-1" sm="12">
          <Button.Ripple
            className="mr-1 sm-mb-1"
            color="secondary"
            outline
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button.Ripple>
          <Button.Ripple type="submit" className="mr-1 sm-mb-1" color="primary">
            Save configurations
          </Button.Ripple>
        </Col>
      </Row>
    </Form>
  )
}

export default EmailConfigurationTabContent
