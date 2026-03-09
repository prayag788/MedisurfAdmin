// ** Core JWT Import
import useJwt from '@src/@core/auth/jwt/useJwt'

const { jwt } = useJwt({
  loginEndpoint: `${process.env.REACT_APP_API_URL}/user/login`,
})

export default jwt
