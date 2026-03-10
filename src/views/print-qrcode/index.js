import React, { Fragment, useRef, useEffect } from 'react'
import { Card, CardHeader, CardBody, CardTitle, Row, Col } from 'reactstrap'
import QRCode from 'qrcode'

// import { useReactToPrint } from 'react-to-print'
import { useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { isUserLoggedIn } from '@utils'

import '@styles/react/pages/print-qr-code.scss'

const printQRcode = () => {
  const navigate = useNavigate()
  const userData = JSON.parse(isUserLoggedIn())
  const location = useLocation()
  const props = location.state
  const componentRef = useRef()
  let QrcodeSrc

  useEffect(() => {
    document.body.classList.add('print-qr-page')
    return () => {
      document.body.classList.remove('print-qr-page')
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }
  if (props && props.URL) {
    QRCode.toDataURL(props.URL, function (err, string) {
      if (err) throw err
      QrcodeSrc = string
    })
  }

  return (
    <Fragment>
      <Card>
        <div className="printQrUpperDiv" ref={componentRef}>
          <CardHeader className="pl-5 pb-0">
            <CardTitle className="printQrTitle mt-5 pt-3">
              <h1 className="text-center">SHARE STUDY INFORMATION</h1>
            </CardTitle>
          </CardHeader>
          <CardBody className="pl-5 pb-0">
            <Row className="mt-5">
              <Col>
                <div>
                  <p>
                    Patient Name:{' '}
                    {props && props.patientName ? props.patientName : '-'}
                  </p>
                  <p>Exam ID: {props && props.examId ? props.examId : '-'}</p>
                  <p>
                    Doctor access code:{' '}
                    <b>{props && props.password ? props.password : '-'}</b>
                  </p>
                  <p>
                    ( Exp:{' '}
                    {props && props.expiryDate
                      ? moment(
                          props.expiryDate.slice(0, -3),
                          'MM-DD-YYYY HH:mm'
                        ).format(userData?.dateFormats?.dateTimeFormat)
                      : '-'}
                    (UTC) )
                  </p>
                </div>
              </Col>
              <Col>
                <div>
                  <h4>Doctor details:-</h4>
                  <p>Name: {props && props.username ? props.username : '-'}</p>
                  <p>
                    Designation:{' '}
                    {props && props.designation ? props.designation : '-'}
                  </p>
                  <p>
                    hospital:{' '}
                    {props && props.hospitalname ? props.hospitalname : '-'}
                  </p>
                  <p>Contact.: {props && props.cno ? props.cno : '-'}</p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div id="canvas">
                  <img src={QrcodeSrc} />
                </div>
                <p>How to use it?</p>
                <p>
                  It will redirect to a web page, enter the doctor access code
                </p>
              </Col>
            </Row>
          </CardBody>
        </div>
        <Row>
          <button
            className="ml-5 mb-2 btn btn-secondary printQrButton"
            onClick={() => {
              navigate(-1)
            }}
          >
            Back
          </button>
          <button
            className="ml-1 mb-2 btn btn-primary printQrButton"
            onClick={handlePrint}
          >
            Print
          </button>
        </Row>
      </Card>
    </Fragment>
  )
}
export default printQRcode
