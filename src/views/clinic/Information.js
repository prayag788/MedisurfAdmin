import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Row,
  Col,
  Label,
  Input,
  Form,
  FormGroup,
  FormFeedback,
} from 'reactstrap'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import { phoneRegExp, websiteRegExp } from './utils/regex'

const Information = ({ toggleTab, redirectList, toEdit }) => {
  const [formData, setFormData] = useState({
    email: toEdit?.email || '',
    contact: toEdit?.contact || '',
    hospital: toEdit?.hospital || '',
    block: toEdit?.address?.block || '',
    city: toEdit?.address?.city || '',
    state: toEdit?.address?.state || '',
    country: toEdit?.address?.country || '',
    pin: toEdit?.address?.pin || '',
    meta: toEdit?.media?.meta || '',
    instagram: toEdit?.media?.instagram || '',
    twitter: toEdit?.media?.twitter || '',
    website: toEdit?.media?.website || '',
  })

  const NewUserSchema = yup.object().shape(
    {
      email: yup
        .string()
        .email()
        .required('Please provide your email address. This field is required.'),
      contact: yup
        .string()
        .matches(phoneRegExp, 'Please enter a valid contact number')
        .required(
          'Please provide your contact information. This field is required.'
        ),
      hospital: yup
        .string()
        .required('Please enter the hospital name. This field is required.'),
      block: yup
        .string()
        .required(
          'Please enter the block information. This field is required.'
        ),
      city: yup
        .string()
        .required('Please select the city status. This field is required.'),
      country: yup
        .string()
        .required('Please enter the country. This field is required.'),
      website: yup.string().when('website', (val) => {
        // if (val?.length > 0) {
        //   return yup.string().matches(websiteRegExp, 'Enter full and proper url').notRequired()
        // } else {
        return yup.string().notRequired()
        // }
      }),
      meta: yup.string().when('meta', (val) => {
        // if (val?.length > 0) {
        //   return yup.string().matches(websiteRegExp, 'Enter full and proper url').notRequired()
        // } else {
        return yup.string().notRequired()
        // }
      }),
      instagram: yup.string().when('instagram', (val) => {
        // if (val?.length > 0) {
        //   return yup.string().matches(websiteRegExp, 'Enter full and proper url').notRequired()
        // } else {
        return yup.string().notRequired()
        // }
      }),
      twitter: yup.string().when('twitter', (val) => {
        // if (val?.length > 0) {
        //   return yup.string().matches(websiteRegExp, 'Enter full and proper url').notRequired()
        // } else {
        return yup.string().notRequired()
        // }
      }),
    },
    [
      ['website', 'website'], //cyclic dependency
      ['meta', 'meta'],
      ['instagram', 'instagram'],
      ['twitter', 'twitter'],
    ]
  )

  const {
    register,
    formState: { errors },
    handleSubmit,
    clearErrors,
    setValue,
    trigger,
  } = useForm({
    mode: toEdit ? 'onSubmit' : 'onBlur',
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      email: toEdit?.email || '',
      contact: toEdit?.contact || '',
      hospital: toEdit?.hospital || '',
      block: toEdit?.address?.block || '',
      city: toEdit?.address?.city || '',
      state: toEdit?.address?.state || '',
      country: toEdit?.address?.country || '',
      pin: toEdit?.address?.pin || '',
      meta: toEdit?.media?.meta || '',
      instagram: toEdit?.media?.instagram || '',
      twitter: toEdit?.media?.twitter || '',
      website: toEdit?.media?.website || '',
    },
  })

  const onSubmit = (data) => {
    const information = {
      email: data.email,
      contact: data.contact,
      hospital: data.hospital,
      address: {
        block: data.block,
        city: data.city,
        state: data.state,
        country: data.country,
        pin: data.pin,
      },
      media: {
        twitter: data.twitter,
        meta: data.meta,
        instagram: data.instagram,
        website: data.website,
      },
    }

    toggleTab('2', information)
  }

  const inputHandler = (e) => {
    const name = e.target.name
    const value = e.target.value

    setFormData((prev) => {
      return { ...prev, [name]: value }
    })

    // Also set the form value for proper validation
    setValue(name, value)

    // Clear errors immediately when user starts typing
    if (errors[name]) {
      clearErrors(name)
    }

    // Only trigger validation on blur for new entries, not during edit
    if (!toEdit) {
      setTimeout(() => {
        trigger(name)
      }, 100)
    }
  }

  // Clear errors when form data has valid values and sync form values
  useEffect(() => {
    // Set form values from formData
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        setValue(key, formData[key])
      }
    })

    // Clear errors for fields that have values
    Object.keys(formData).forEach((key) => {
      if (formData[key] && errors[key]) {
        clearErrors(key)
      }
    })
  }, [formData, clearErrors, setValue, errors])

  // Initialize form values when editing and clear all errors
  useEffect(() => {
    if (toEdit) {
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          setValue(key, formData[key])
        }
      })
      // Clear all errors when in edit mode
      clearErrors()
    }
  }, [toEdit, setValue, formData, clearErrors])

  return (
    <Card>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="justify-content-start mx-0 p-1">
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="hospital">Hospital name </Label>
              <Input
                name="hospital"
                id="hospital"
                defaultValue={toEdit && toEdit.hospital ? toEdit.hospital : ''}
                {...register('hospital', { required: true })}
                invalid={errors?.hospital && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.hospital) {
                    clearErrors('hospital')
                  }
                }}
                onBlur={toEdit ? undefined : () => trigger('hospital')}
                autoComplete="off"
              />
              {errors?.hospital && (
                <FormFeedback className="d-block">
                  {errors.hospital.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="email">Email </Label>
              <Input
                name="email"
                id="email"
                defaultValue={toEdit && toEdit.email ? toEdit.email : ''}
                {...register('email', { required: true })}
                invalid={errors?.email && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.email) {
                    clearErrors('email')
                  }
                }}
                onBlur={toEdit ? undefined : () => trigger('email')}
                autoComplete="off"
              />
              {errors?.email && (
                <FormFeedback className="d-block">
                  {errors.email.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="contact">Contact </Label>
              <Input
                name="contact"
                id="contact"
                defaultValue={toEdit && toEdit.contact ? toEdit.contact : ''}
                {...register('contact', { required: true })}
                invalid={errors?.contact && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.contact) {
                    clearErrors('contact')
                  }
                }}
                onBlur={toEdit ? undefined : () => trigger('contact')}
                autoComplete="off"
              />
              {errors?.contact && (
                <FormFeedback className="d-block">
                  {errors.contact.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
        </Row>
        <Row className="justify-content-start mx-0 pt-1 pl-1 pr-1">
          <Col
            className="d-flex align-items-start justify-content-start"
            md="4"
            sm="12"
          >
            <Label className="mr-1 font-weight-bold" for="search-input">
              Address:
            </Label>
          </Col>
        </Row>
        <Row className="justify-content-start mx-0 pl-1 pr-1">
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="block">House/Block/Street </Label>
              <Input
                name="block"
                id="block"
                defaultValue={
                  toEdit && toEdit.address?.block ? toEdit.address.block : ''
                }
                {...register('block', { required: true })}
                invalid={errors?.block && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.block) {
                    clearErrors('block')
                  }
                }}
                onBlur={toEdit ? undefined : () => trigger('block')}
                autoComplete="off"
              />
              {errors?.block && (
                <FormFeedback className="d-block">
                  {errors.block.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="city">City </Label>
              <Input
                name="city"
                id="city"
                defaultValue={
                  toEdit && toEdit.address?.city ? toEdit.address.city : ''
                }
                {...register('city', { required: true })}
                invalid={errors?.city && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.city) {
                    clearErrors('city')
                  }
                }}
                onBlur={toEdit ? undefined : () => trigger('city')}
                autoComplete="off"
              />
              {errors?.city && (
                <FormFeedback className="d-block">
                  {errors.city.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="state">State </Label>
              <Input
                name="state"
                id="state"
                defaultValue={
                  toEdit && toEdit.address?.state ? toEdit.address.state : ''
                }
                {...register('state')}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.state) {
                    clearErrors('state')
                  }
                }}
                autoComplete="off"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row className="justify-content-start mx-0 pl-1 pr-1">
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="country">Country </Label>
              <Input
                name="country"
                id="country"
                defaultValue={
                  toEdit && toEdit.address?.country
                    ? toEdit.address.country
                    : ''
                }
                {...register('country', { required: true })}
                invalid={errors?.country && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.country) {
                    clearErrors('country')
                  }
                }}
                onBlur={toEdit ? undefined : () => trigger('country')}
                autoComplete="off"
              />
              {errors?.country && (
                <FormFeedback className="d-block">
                  {errors.country.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="pin">Post code </Label>
              <Input
                name="pin"
                id="pin"
                defaultValue={
                  toEdit && toEdit.address?.pin ? toEdit.address.pin : ''
                }
                {...register('pin')}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.pin) {
                    clearErrors('pin')
                  }
                }}
                autoComplete="off"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row className="justify-content-start mx-0 pt-1 pl-1 pr-1">
          <Col
            className="d-flex align-items-start justify-content-start"
            md="4"
            sm="12"
          >
            <Label className="mr-1 font-weight-bold" for="search-input">
              Social media:
            </Label>
          </Col>
        </Row>
        <Row className="justify-content-start mx-0 pl-1 pr-1">
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="website">Website </Label>
              <Input
                name="website"
                id="website"
                defaultValue={
                  toEdit && toEdit.media?.website ? toEdit.media.website : ''
                }
                placeholder={`${process.env.REACT_APP_URL}`}
                {...register('website')}
                invalid={errors?.website && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.website) {
                    clearErrors('website')
                  }
                }}
                autoComplete="off"
              />
              {errors?.website && (
                <FormFeedback className="d-block">
                  {errors.website.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="meta">Meta </Label>
              <Input
                name="meta"
                id="meta"
                defaultValue={
                  toEdit && toEdit.media?.meta ? toEdit.media.meta : ''
                }
                placeholder="https://www.meta.com/media"
                {...register('meta')}
                invalid={errors?.meta && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.meta) {
                    clearErrors('meta')
                  }
                }}
                autoComplete="off"
              />
              {errors?.meta && (
                <FormFeedback className="d-block">
                  {errors.meta.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="instagram">Instagram </Label>
              <Input
                name="instagram"
                id="instagram"
                defaultValue={
                  toEdit && toEdit.media?.instagram
                    ? toEdit.media.instagram
                    : ''
                }
                placeholder="https://www.instagram.com/media"
                {...register('instagram')}
                invalid={errors?.instagram && true}
                onChange={inputHandler}
                onFocus={() => {
                  if (errors?.instagram) {
                    clearErrors('instagram')
                  }
                }}
                autoComplete="off"
              />
              {errors?.instagram && (
                <FormFeedback className="d-block">
                  {errors.instagram.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
        </Row>
        <Row className="justify-content-end mx-0 p-2">
          <div className="d-flex mt-md-0 mt-1">
            <Button
              className="ml-2 cursor-pointer"
              color="outline-danger"
              onClick={() => redirectList(false)}
            >
              <span className="align-middle">Cancel</span>
            </Button>
          </div>
          <div className="d-flex mt-md-0 mt-1">
            <Button
              className="ml-2 cursor-pointer"
              color="primary"
              type="submit"
            >
              <span className="align-middle">Next</span>
            </Button>
          </div>
        </Row>
      </Form>
    </Card>
  )
}

export default Information
