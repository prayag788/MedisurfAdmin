import { useParams } from 'react-router-dom'
import { isUserLoggedIn } from '@utils'

const View = () => {
  const { StudyInstanceUID } = useParams()
  const userData = JSON.parse(isUserLoggedIn())

  return (
    <div style={{ height: '100vh' }}>
      <iframe
        style={{ height: '100vh', width: '100vw', border: 'none' }}
        src={`${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${StudyInstanceUID}&accessToken=${localStorage.getItem('accessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}`}
        title="{`${process.env.REACT_APP_INNER_NAME}`}"
        referrerPolicy="http://localhost:3000"
      ></iframe>
    </div>
  )
}

export default View
