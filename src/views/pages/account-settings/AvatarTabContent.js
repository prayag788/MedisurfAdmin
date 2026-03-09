import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Form,
  Row,
  Col,
  Card,
  Button,
  Input,
  Label,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap'
import axios from 'axios'
// ** Sweet Alert Setup
// centralized alerts
import { useEffect, useState } from 'react'
// removed inline toast components in favor of utils/toast
import ROLES from '@configs/roles'
import { Pagination } from 'swiper' // for using swiper this setting is only support with swiper@7.3.1
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { useDispatch } from 'react-redux'
import { handleUserAvatar } from '@store/actions/navbar'
import { showErrorAlert, showSuccessAlert, getErrorMessage } from '../../../utils/alerts'
const AdminImages = require.context('@src/assets/images/roleAvatar/admin', true)
const RadiologistImages = require.context('@src/assets/images/roleAvatar/radiologist', true)
const TechnicianImages = require.context('@src/assets/images/roleAvatar/technician', true)
const DoctorImages = require.context('@src/assets/images/roleAvatar/doctor', true)
const PowerUserImages = require.context('@src/assets/images/roleAvatar/power-user', true)
const ReferringDoctorImages = require.context(
  '@src/assets/images/roleAvatar/referring-doctor',
  true
)

// no direct SweetAlert usage here

const AvatarTabContent = () => {
  const navigate = useNavigate()
  const [defaultValues, setDefaultValues] = useState({
    email_transport: 'mailgun',
  })
  const [loading, setLoading] = useState(false)
  const [inputFields, setInputFields] = useState([
    { label: 'API-key', type: 'text', key: 'API-key', id: 'api_key' },
    { label: 'Domain-name', type: 'text', key: 'Domain-name', id: 'domain' },
    {
      from: [
        { label: 'From name', type: 'text', key: 'From name', id: 'from_name' },
        { label: 'From address', type: 'email', key: 'From address', id: 'from_address' },
      ],
    },
  ])
  const [selectedOption, setSelectedOption] = useState('mailgun')
  const [initialEmailConfiguration, setInitialEmailConfiguration] = useState({})
  const [formContents, setFormContents] = useState({})
  const [submitFromTestEmail, setSubmitFromTestEmail] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [avatarFromApi, setAvatarFromApi] = useState(null)
  const userDetails = JSON.parse(localStorage.getItem('userData')) || {}
  const [emailVal, setEmailVal] = useState(userDetails?.email || '')
  const [imageList, setImageList] = useState([])
  const dispatch = useDispatch()

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {}
      const getUrl = (context, key) => {
        const m = context(key)
        return (m && m.default) || m
      }
      let images = []
      const role = userData?.role
      if (
        role === ROLES.ClinicAdmin ||
        role === ROLES.ClinicUser ||
        role === ROLES.Admin ||
        role === ROLES.SuperAdmin
      ) {
        images = AdminImages.keys().map(key => getUrl(AdminImages, key))
      } else if (role === ROLES.Doctor) {
        images = DoctorImages.keys().map(key => getUrl(DoctorImages, key))
      } else if (role === ROLES.PowerUser) {
        images = PowerUserImages.keys().map(key => getUrl(PowerUserImages, key))
      } else if (role === ROLES.TechnicianUser) {
        images = TechnicianImages.keys().map(key => getUrl(TechnicianImages, key))
      } else if (role === ROLES.RadiologistUser) {
        images = RadiologistImages.keys().map(key => getUrl(RadiologistImages, key))
      } else if (role === ROLES.ReferringDoctor) {
        images = ReferringDoctorImages.keys().map(key => getUrl(ReferringDoctorImages, key))
      }
      setImageList(images.filter(Boolean))
    } catch (error) {
      console.error('Error loading avatar images:', error)
      setImageList([])
    }
  }, [])

  // toast content moved to utils/toast

  const selectAvatar = yup.object().shape({
    avatarImage: yup.string().required('Please select an avatar'),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(selectAvatar),
  })

  const selectImageHandler = item => {
    setSelectedImage(item)
    setValue('avatarImage', item)
  }

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/avatar`)
      .then(res => {
        if (res?.data?.status) {
          const avatarValue = res?.data?.avatar
          if (avatarValue) {
            setAvatarFromApi(avatarValue)
          }
        }
        setLoading(false)
      })
      .catch(err => {
        console.log(err, 'err')
        showErrorAlert(getErrorMessage(err) || 'Something went wrong')
        setLoading(false)
      })
  }, [])

  // When we have both imageList and avatarFromApi, resolve selection: use API avatar if it exists in list, otherwise default to first avatar
  useEffect(() => {
    if (imageList.length === 0) return
    const apiAvatarInList = avatarFromApi && imageList.some(img => img === avatarFromApi)
    const effectiveSelected = apiAvatarInList ? avatarFromApi : imageList[0]
    setSelectedImage(effectiveSelected)
    setValue('avatarImage', effectiveSelected)
  }, [imageList, avatarFromApi])

  const onSubmit = async bodyData => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/user/avatar`, bodyData)
      .then(data => {
        // Update header avatar immediately so it reflects without waiting for alert dismiss
        const userDetails = JSON.parse(localStorage.getItem('userData')) || {}
        userDetails.avatar = bodyData.avatarImage
        dispatch(handleUserAvatar(bodyData.avatarImage))
        localStorage.setItem('userData', JSON.stringify(userDetails))
        showSuccessAlert(data.data.message.message || 'User avatar is updated!')
      })
      .catch(err => {
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  const CancelForm = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col sm="12">
          <Label>Avatar list:</Label>
        </Col>
      </Row>
      <Row className="mt-2 pb-2 px-1">
        <Swiper
          slidesPerView={4}
          spaceBetween={30}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination]}
          className="mySwiper"
        >
          {imageList.length > 0 ? (
            imageList.map((item, index) => (
                <SwiperSlide
                  key={index}
                  className="mh-25"
                  style={{ maxHeight: '500px', maxWidth: '100px' }}
                >
                  <Input
                    type="radio"
                    id={`image-${index + 1}`}
                    name="avatarImage"
                    className="image-checkbox"
                    value={item}
                    {...register('avatarImage', { required: true })}
                    onChange={() => selectImageHandler(item)}
                    checked={selectedImage === item}
                  />
                  <label className="avatar-image-label" htmlFor={`image-${index + 1}`}>
                    <img src={item} alt={`Avatar ${index + 1}`} height="100%" />
                  </label>
                </SwiperSlide>
              ))
          ) : (
            <div className="text-center p-3">
              <p>No avatar images available for your role.</p>
            </div>
          )}
        </Swiper>
        {imageList.map((item, index) => (
          <UncontrolledTooltip target={`image-${index + 1}`} className="tooltip-react-strap">
            Check to set image as avatar
          </UncontrolledTooltip>
        ))}
      </Row>
      {errors?.avatarImage && (
        <Row>
          <p className="mb-0 avatar-image-error">{errors.avatarImage.message}</p>
        </Row>
      )}

      <Row>
        <Col sm="12">
          <Button.Ripple className="mr-1 sm-mb-1" color="secondary" outline onClick={CancelForm}>
            Cancel
          </Button.Ripple>
          <Button.Ripple type="submit" className="mr-1 sm-mb-1" color="primary">
            Save Avatar
          </Button.Ripple>
        </Col>
      </Row>
    </Form>
  )
}

export default AvatarTabContent
