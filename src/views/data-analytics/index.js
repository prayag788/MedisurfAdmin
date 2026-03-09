import { Fragment, useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { Users, FileText } from 'react-feather'
import axios from 'axios'
import ROLES from '@configs/roles'
import { useNavigate } from 'react-router-dom'

// ** Centralized Alerts
import { showErrorAlert, getErrorMessage } from '../../utils/alerts'
import '@styles/react/libs/flatpickr/flatpickr.scss'

export default () => {
  const [data, setData] = useState({
    totalUsers: '-',
    totalDoctors: '-',
    totalReferringDoctors: '-',
    totalPU: '-',
    totalRDU: '-',
    totalTCU: '-',
    totalFS: '-',
  })

  const userData = JSON.parse(localStorage.getItem('userData'))
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/analytics`)
      .then(doc => {
        const raw = doc.data?.data || {}
        setData({
          totalUsers: raw.totalUsers ?? '-',
          totalDoctors: raw.totalDoctors ?? '-',
          totalReferringDoctors: raw.totalReferringDoctors ?? '-',
          totalPU: raw.totalPU ?? '-',
          totalRDU: raw.totalRDU ?? '-',
          totalTCU: raw.totalTCU ?? '-',
          totalFS: raw.totalFS ?? '-',
        })
      })
      .catch(err => {
        showErrorAlert(
          getErrorMessage(err) || 'Error occurred while fetching the data',
          '<p>Error!</p>'
        )
      })
  }, [])

  const redirectUser = userType => {
    if (userData.role === ROLES.ClinicAdmin) navigate(userType)
  }

  return (
    <Fragment>
      {(userData.role === ROLES.ClinicAdmin ||
        userData.role === ROLES.SuperAdmin ||
        userData.role === ROLES.RadiologistUser) && (
        <>
          <Row>
            <Col lg="4" sm="6">
              <StatsHorizontal
                className="all-user-count"
                icon={<Users size={21} />}
                color="primary"
                stats={data.totalUsers}
                statTitle="Total Users"
              />
            </Col>
            <Col lg="4" sm="6">
              <StatsHorizontal
                icon={
                  <span onClick={() => redirectUser('/doctors')}>
                    <Users size={21} />
                  </span>
                }
                color="success"
                stats={data.totalDoctors}
                statTitle="Total Doctors"
              />
            </Col>
            <Col lg="4" sm="6">
              <StatsHorizontal
                icon={
                  <span onClick={() => redirectUser('/referring-doctor')}>
                    <Users size={21} />
                  </span>
                }
                color="success"
                stats={data.totalReferringDoctors}
                statTitle="Total Referring Doctors"
              />
            </Col>
            <Col lg="4" sm="6">
              <StatsHorizontal
                icon={
                  <span onClick={() => redirectUser('/power-user')}>
                    <Users size={21} />
                  </span>
                }
                color="danger"
                stats={data.totalPU}
                statTitle="Total Power Users"
              />
            </Col>
            <Col lg="4" sm="6">
              <StatsHorizontal
                icon={
                  <span onClick={() => redirectUser('/radiologist-user')}>
                    <Users size={21} />
                  </span>
                }
                color="warning"
                stats={data.totalRDU}
                statTitle="Total Radiologist"
              />
            </Col>
            <Col lg="4" sm="6">
              <StatsHorizontal
                icon={
                  <span onClick={() => redirectUser('/technician-user')}>
                    <Users size={21} />
                  </span>
                }
                color="info"
                stats={data.totalTCU}
                statTitle="Total Technologist"
              />
            </Col>
            <Col lg="4" sm="6">
              <StatsHorizontal
                icon={
                  <span onClick={() => redirectUser('/study-list')}>
                    <FileText size={21} />
                  </span>
                }
                color="secondary"
                stats={data.totalFS}
                statTitle="Total Finalized Studies"
              />
            </Col>
          </Row>
        </>
      )}
    </Fragment>
  )
}
