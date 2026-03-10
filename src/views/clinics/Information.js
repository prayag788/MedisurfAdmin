import { useState } from 'react'
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
    email: '',
    contact: '',
    hospital: '',
    block: '',
    city: '',
    state: '',
    country: '',
    ping: '',
    meta: '',
    instagram: '',
    twitter: '',
    website: '',
    twitter: '',
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
        if (val?.length > 0) {
          return yup
            .string()
            .matches(websiteRegExp, 'Enter full and proper url')
        } else {
          return yup.string().notRequired()
        }
      }),
      meta: yup.string().when('meta', (val) => {
        if (val?.length > 0) {
          return yup
            .string()
            .matches(websiteRegExp, 'Enter full and proper url')
        } else {
          return yup.string().notRequired()
        }
      }),
      instagram: yup.string().when('instagram', (val) => {
        if (val?.length > 0) {
          return yup
            .string()
            .matches(websiteRegExp, 'Enter full and proper url')
        } else {
          return yup.string().notRequired()
        }
      }),
      twitter: yup.string().when('twitter', (val) => {
        if (val?.length > 0) {
          return yup
            .string()
            .matches(websiteRegExp, 'Enter full and proper url')
        } else {
          return yup.string().notRequired()
        }
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
  } = useForm({ mode: 'onSubmit', resolver: yupResolver(NewUserSchema) })

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
    setFormData((prev) => {
      return { ...prev, [name]: e.target.value }
    })
  }

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
                onChange={inputHandler}
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
                onChange={inputHandler}
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
                onChange={inputHandler}
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
                  toEdit && toEdit.address.block ? toEdit.address.block : ''
                }
                {...register('block', { required: true })}
                onChange={inputHandler}
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
                id="licenseId"
                defaultValue={
                  toEdit && toEdit.address.city ? toEdit.address.city : ''
                }
                {...register('city', { required: true })}
                onChange={inputHandler}
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
                  toEdit && toEdit.address.state ? toEdit.address.state : ''
                }
                {...register('state', { required: true })}
                onChange={inputHandler}
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
                  toEdit && toEdit.address.country ? toEdit.address.country : ''
                }
                {...register('country', { required: true })}
                onChange={inputHandler}
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
                  toEdit && toEdit.address.pin ? toEdit.address.pin : ''
                }
                {...register('pin', { required: true })}
                onChange={inputHandler}
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
                  toEdit && toEdit.media.website ? toEdit.media.website : ''
                }
                placeholder={`${process.env.REACT_APP_URL}`}
                {...register('website', { required: true })}
                onChange={inputHandler}
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
                  toEdit && toEdit.media.meta ? toEdit.media.meta : ''
                }
                placeholder="https://www.meta.com/media"
                {...register('meta', { required: true })}
                onChange={inputHandler}
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
                  toEdit && toEdit.media.instagram ? toEdit.media.instagram : ''
                }
                placeholder="https://www.instagram.com/media"
                {...register('instagram', { required: true })}
                onChange={inputHandler}
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
